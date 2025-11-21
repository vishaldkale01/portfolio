import { io, Socket } from "socket.io-client";

// Define your event types (optional but recommended)
interface ServerToClientEvents {
  "server-message": (msg: string) => void;
}

interface ClientToServerEvents {
  "send-message": (msg: string) => void;
}

// Create the socket instance with full types
export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  "https://portfolio-etg0.onrender.com",
  {
    autoConnect: true,
  }
);
