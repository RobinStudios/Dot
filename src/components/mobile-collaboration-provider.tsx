import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createCollaborationManager } from '@/lib/realtime/collaboration-manager';

interface MobileCollaborationContextProps {
  cursors: any[];
  elements: any[];
  comments: any[];
  users: string[];
  connect: () => void;
  disconnect: () => void;
  updateCursor: (x: number, y: number) => void;
  updateElement: (elementId: string, changes: any) => void;
  addComment: (comment: any) => void;
}

const MobileCollaborationContext = createContext<MobileCollaborationContextProps | undefined>(undefined);

export const useMobileCollaboration = () => {
  const ctx = useContext(MobileCollaborationContext);
  if (!ctx) throw new Error('useMobileCollaboration must be used within MobileCollaborationProvider');
  return ctx;
};

export const MobileCollaborationProvider: React.FC<{ roomId: string; userId: string; userName: string; children: React.ReactNode }> = ({ roomId, userId, userName, children }) => {
  const managerRef = useRef<any>(null);
  const [cursors, setCursors] = useState<any[]>([]);
  const [elements, setElements] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [users, setUsers] = useState<string[]>([]);

  useEffect(() => {
    managerRef.current = createCollaborationManager(roomId, userId, userName);
    managerRef.current.onCursorsUpdate(setCursors);
    managerRef.current.onElementsUpdate((data: any) => {
      setElements((prev) => {
        // Merge or update elements as needed
        return prev;
      });
    });
    managerRef.current.onUsersUpdate(setUsers);
    // TODO: Add comments real-time sync if supported
    managerRef.current.connect();
    return () => {
      managerRef.current.disconnect();
    };
  }, [roomId, userId, userName]);

  const updateCursor = (x: number, y: number) => managerRef.current?.updateCursor(x, y);
  const updateElement = (elementId: string, changes: any) => managerRef.current?.updateElement(elementId, changes);
  const addComment = (comment: any) => setComments((prev) => [...prev, comment]); // TODO: sync with backend

  return (
    <MobileCollaborationContext.Provider value={{ cursors, elements, comments, users, connect: managerRef.current?.connect, disconnect: managerRef.current?.disconnect, updateCursor, updateElement, addComment }}>
      {children}
    </MobileCollaborationContext.Provider>
  );
};
