// sw.js - Service Worker para notificações push

self.addEventListener('install', (event) => {
    console.log('Service Worker instalado');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker ativado');
    event.waitUntil(clients.claim());
});

// Receber push notifications
self.addEventListener('push', (event) => {
    console.log('Push recebido:', event);
    
    let data = {
        title: 'Nova Atualização',
        body: 'Você tem uma nova notificação',
        icon: '/icon.png',
        badge: '/badge.png'
    };

    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        vibrate: [200, 100, 200, 100, 200],
        sound: 'default',
        requireInteraction: true,
        data: {
            url: data.url || '/'
        },
        actions: [
            {
                action: 'open',
                title: 'Abrir'
            },
            {
                action: 'close',
                title: 'Fechar'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Clique na notificação
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'close') return;

    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            // Se já tem uma janela aberta, focar nela
            for (const client of clientList) {
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            // Se não, abrir nova janela
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});
