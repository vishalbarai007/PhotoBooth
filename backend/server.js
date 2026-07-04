import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();

const allowedOrigins = [
  "http://localhost:3000", // For local development
  "https://photo-booth-ten-green.vercel.app" // REPLACE THIS with your actual Vercel URL
];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST'],
  credentials: true
}));

const httpServer = createServer(app);

// In-memory room storage
const rooms = new Map();

// Helper to generate room codes
function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Guarantee uniqueness
  if (rooms.has(code)) {
    return generateRoomCode();
  }
  return code;
}

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  },
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Create room handler
  socket.on('create_room', ({ username }) => {
    const roomId = generateRoomCode();
    const roomState = {
      roomId,
      users: [
        { id: socket.id, username: username || 'User 1', role: 'creator' }
      ],
      photos: {
        creator: [null, null, null],
        joiner: [null, null, null],
      },
      style: {
        frameId: 'polaroid',
        caption: '',
        bgColor: 'transparent',
      },
    };

    rooms.set(roomId, roomState);
    socket.join(roomId);
    socket.emit('room_created', roomState);
    console.log(`Room created: ${roomId} by ${socket.id}`);
  });

  // Join room handler
  socket.on('join_room', ({ roomId, username }) => {
    const upperRoomId = roomId?.toUpperCase();
    const room = rooms.get(upperRoomId);
    if (!room) {
      socket.emit('error_message', { message: 'Room not found.' });
      return;
    }

    if (room.users.length >= 2) {
      socket.emit('error_message', { message: 'Room is full.' });
      return;
    }

    // Add user as joiner
    const newUser = { id: socket.id, username: username || 'User 2', role: 'joiner' };
    room.users.push(newUser);
    socket.join(upperRoomId);

    socket.emit('room_joined', room);
    io.to(upperRoomId).emit('room_updated', room);
    console.log(`User ${socket.id} joined room ${upperRoomId}`);
  });

  // Photo capture event handler
  socket.on('photo_captured', ({ roomId, index, imageData }) => {
    const upperRoomId = roomId?.toUpperCase();
    const room = rooms.get(upperRoomId);
    if (!room) return;

    const user = room.users.find(u => u.id === socket.id);
    if (!user) return;

    if (user.role === 'creator') {
      room.photos.creator[index] = imageData;
    } else {
      room.photos.joiner[index] = imageData;
    }

    io.to(upperRoomId).emit('room_updated', room);
    console.log(`Photo captured in room ${upperRoomId} by ${user.role} at index ${index}`);
  });

  // Photo retake event handler
  socket.on('photo_retake', ({ roomId, index }) => {
    const upperRoomId = roomId?.toUpperCase();
    const room = rooms.get(upperRoomId);
    if (!room) return;

    const user = room.users.find(u => u.id === socket.id);
    if (!user) return;

    if (user.role === 'creator') {
      room.photos.creator[index] = null;
    } else {
      room.photos.joiner[index] = null;
    }

    io.to(upperRoomId).emit('room_updated', room);
    console.log(`Photo reset/retake in room ${upperRoomId} by ${user.role} at index ${index}`);
  });

  // Synchronized countdown trigger
  socket.on('start_sync_countdown', ({ roomId }) => {
    const upperRoomId = roomId?.toUpperCase();
    io.to(upperRoomId).emit('sync_countdown_started');
    console.log(`Sync countdown started in room ${upperRoomId}`);
  });

  // Pose/status updates
  socket.on('update_status', ({ roomId, status }) => {
    const upperRoomId = roomId?.toUpperCase();
    const room = rooms.get(upperRoomId);
    if (!room) return;
    const user = room.users.find(u => u.id === socket.id);
    if (!user) return;
    
    socket.to(upperRoomId).emit('partner_status_updated', {
      username: user.username,
      role: user.role,
      status
    });
  });

  // Style customization sync
  socket.on('update_style', ({ roomId, style }) => {
    const upperRoomId = roomId?.toUpperCase();
    const room = rooms.get(upperRoomId);
    if (!room) return;

    room.style = { ...room.style, ...style };
    io.to(upperRoomId).emit('room_updated', room);
    console.log(`Style updated in room ${upperRoomId}`);
  });

  // Reset room (start over)
  socket.on('reset_room', ({ roomId }) => {
    const upperRoomId = roomId?.toUpperCase();
    const room = rooms.get(upperRoomId);
    if (!room) return;

    room.photos = {
      creator: [null, null, null],
      joiner: [null, null, null],
    };
    room.style = {
      frameId: 'polaroid',
      caption: '',
      bgColor: 'transparent',
    };

    io.to(upperRoomId).emit('room_updated', room);
    io.to(upperRoomId).emit('room_reset');
    console.log(`Room reset in ${upperRoomId}`);
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    for (const [roomId, room] of rooms.entries()) {
      const userIndex = room.users.findIndex(u => u.id === socket.id);
      if (userIndex !== -1) {
        const removedUser = room.users.splice(userIndex, 1)[0];
        console.log(`User ${removedUser.username} (${removedUser.role}) left room ${roomId}`);
        
        if (room.users.length === 0) {
          // Room is empty, delete it
          rooms.delete(roomId);
          console.log(`Deleted empty room: ${roomId}`);
        } else {
          // Notify the other user
          io.to(roomId).emit('partner_disconnected', {
            message: `${removedUser.username} disconnected.`,
          });
          io.to(roomId).emit('room_updated', room);
        }
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Socket server is running on port ${PORT}`);
});


