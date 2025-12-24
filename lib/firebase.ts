
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, push, set, update, increment, get } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDbbFk3QJcyplWicP9RtQwo1U2Vz2YyeOA",
  authDomain: "somosum-comentarios.firebaseapp.com",
  projectId: "somosum-comentarios",
  storageBucket: "somosum-comentarios.firebasestorage.app",
  messagingSenderId: "125576297132",
  appId: "1:125576297132:web:ad73029f7373701959bd09",
  measurementId: "G-9TX3VBBXPE",
  databaseURL: "https://somosum-comentarios-default-rtdb.firebaseio.com/" 
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

export const commentsService = {
  subscribeToComments: (postId: string, callback: (comments: any[]) => void) => {
    const commentsRef = ref(db, 'conversas/' + postId);
    return onValue(commentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const commentsList = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          ...value,
          time: value.hora ? new Date(value.hora).toLocaleDateString() : 'Agora'
        }));
        callback(commentsList);
      } else {
        callback([]);
      }
    });
  },

  getAllConversations: (callback: (allComments: any[]) => void) => {
    const commentsRef = ref(db, 'conversas');
    return onValue(commentsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return callback([]);
      
      const flattened: any[] = [];
      Object.keys(data).forEach(postId => {
        Object.entries(data[postId]).forEach(([commentId, comment]: [string, any]) => {
          flattened.push({
            id: commentId,
            postId,
            ...comment
          });
        });
      });
      callback(flattened);
    });
  },

  addComment: async (postId: string, comment: any) => {
    const commentsRef = ref(db, 'conversas/' + postId);
    const newCommentRef = push(commentsRef);
    return set(newCommentRef, {
      ...comment,
      likes: 0,
      hora: Date.now()
    });
  },

  addReply: async (postId: string, parentId: string, reply: any) => {
    const commentsRef = ref(db, `conversas/${postId}`);
    const newCommentRef = push(commentsRef);
    return set(newCommentRef, {
      ...reply,
      parentId,
      likes: 0,
      hora: Date.now()
    });
  },

  likeComment: async (postId: string, commentId: string) => {
    const commentRef = ref(db, `conversas/${postId}/${commentId}`);
    return update(commentRef, {
      likes: increment(1)
    });
  }
};
