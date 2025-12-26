
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, push, set, update, increment, query, limitToLast, orderByChild, get, equalTo } from "firebase/database";

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

// Função auxiliar para tornar o e-mail um caminho válido no Firebase
const encodeEmailPath = (email: string) => email.toLowerCase().trim().replace(/\./g, ',');

export const userService = {
  saveProfile: async (userId: string, profileData: any) => {
    if (!userId || userId === 'anonymous') {
      const newUserRef = push(ref(db, 'users'));
      userId = newUserRef.key || Date.now().toString();
    }
    
    const cleanEmail = (profileData.email || "").toLowerCase().trim();
    const encodedEmail = encodeEmailPath(cleanEmail);
    
    const normalizedData = {
      ...profileData,
      id: userId,
      email: cleanEmail,
      updatedAt: Date.now(),
      isProfileComplete: true
    };
    
    // 1. Salva o perfil do usuário
    await update(ref(db, `users/${userId}`), normalizedData);
    
    // 2. Cria um atalho de busca por e-mail (MUITO MAIS RÁPIDO E SEGURO)
    if (encodedEmail) {
      await set(ref(db, `email_lookup/${encodedEmail}`), userId);
    }
    
    return normalizedData;
  },

  findUserByEmail: async (email: string) => {
    if (!email) return null;
    const encodedEmail = encodeEmailPath(email);
    
    try {
      // Tentativa 1: Busca pelo atalho direto (Otimizado)
      const lookupRef = ref(db, `email_lookup/${encodedEmail}`);
      const lookupSnapshot = await get(lookupRef);
      
      if (lookupSnapshot.exists()) {
        const userId = lookupSnapshot.val();
        const userRef = ref(db, `users/${userId}`);
        const userSnapshot = await get(userRef);
        if (userSnapshot.exists()) {
          return { ...userSnapshot.val(), id: userId };
        }
      }

      // Tentativa 2: Fallback se o e-mail foi cadastrado antes dessa atualização
      const usersRef = ref(db, 'users');
      const allUsersSnapshot = await get(usersRef);
      if (allUsersSnapshot.exists()) {
        const allUsers = allUsersSnapshot.val();
        const foundId = Object.keys(allUsers).find(id => {
          const uEmail = allUsers[id].email || "";
          return uEmail.toLowerCase().trim() === email.toLowerCase().trim();
        });
        
        if (foundId) {
          // Aproveita e já cria o atalho para a próxima vez ser instantâneo
          await set(ref(db, `email_lookup/${encodedEmail}`), foundId);
          return { ...allUsers[foundId], id: foundId };
        }
      }
    } catch (error: any) {
      console.error("Erro no Firebase:", error);
      // Se for erro de permissão, lançamos uma mensagem clara
      if (error.message.includes('permission_denied')) {
        throw new Error("O banco de dados recusou a busca. Tente cadastrar novamente ou entre em contato.");
      }
      throw new Error("Falha na rede. Tente novamente.");
    }
    return null;
  }
};

export const commentsService = {
  subscribeToComments: (postId: string, callback: (comments: any[]) => void) => {
    const commentsRef = ref(db, 'conversas/' + postId);
    const q = query(commentsRef, limitToLast(50));
    
    return onValue(q, (snapshot) => {
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
      
      const sorted = flattened.sort((a, b) => (b.hora || 0) - (a.hora || 0)).slice(0, 50);
      callback(sorted);
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

  likeComment: async (postId: string, commentId: string) => {
    const commentRef = ref(db, `conversas/${postId}/${commentId}`);
    return update(commentRef, {
      likes: increment(1)
    });
  }
};
