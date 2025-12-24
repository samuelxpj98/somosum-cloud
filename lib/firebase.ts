
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, push, set, serverTimestamp } from "firebase/database";

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
  // Escuta os comentários de um post específico
  subscribeToComments: (postId: string, callback: (comments: any[]) => void) => {
    const commentsRef = ref(db, 'conversas/' + postId);
    
    // O 'onValue' é o segredo do tempo real. Ele não trava o app porque roda fora da thread principal de renderização do React
    return onValue(commentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Converte o objeto do Firebase em um Array para o React entender
        const commentsList = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          ...value,
          time: value.hora ? new Date(value.hora).toLocaleDateString() : 'Agora'
        })).reverse(); // Mais novos primeiro
        callback(commentsList);
      } else {
        callback([]);
      }
    });
  },

  // Envia um comentário
  addComment: async (postId: string, comment: any) => {
    const commentsRef = ref(db, 'conversas/' + postId);
    const newCommentRef = push(commentsRef);
    return set(newCommentRef, {
      ...comment,
      hora: Date.now()
    });
  }
};
