// Importa os scripts do Firebase versão compatível para rodar em Service Workers
importScripts('https://www.gstatic.com/firebasejs/11.0.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.2/firebase-messaging-compat.js');

// Inicializa o app do Firebase no background usando as suas chaves
firebase.initializeApp({
    apiKey: "AIzaSyC3lMDr8wv2sbyKrQ_g_QbwF-La-iBcj2s",
    authDomain: "form-61cb3.firebaseapp.com",
    projectId: "form-61cb3",
    storageBucket: "form-61cb3.firebasestorage.app",
    messagingSenderId: "856018845836",
    appId: "1:856018845836:web:aca36b5d63287a45afbba9",
    measurementId: "G-EKPPTKSHH7"
});

// Recupera a instância do Messaging
const messaging = firebase.messaging();

// Fica escutando as mensagens quando o site estiver fechado ou em segundo plano
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Mensagem recebida em segundo plano: ', payload);
  
  const notificationTitle = payload.notification?.title || 'Novo Alerta do CRM';
  const notificationOptions = {
    body: payload.notification?.body || 'Você tem uma nova notificação.',
    icon: 'https://cdn-icons-png.flaticon.com/512/1828/1828817.png' // Ícone padrão que vai aparecer
  };

  // Exibe a notificação no celular/PC
  self.registration.showNotification(notificationTitle, notificationOptions);
});
