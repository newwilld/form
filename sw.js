// sw.js - Service Worker Otimizado para iOS

// Versão do SW para forçar atualização
const CACHE_VERSION = 'v2.0';
const CACHE_NAME = `briefing-cache-${CACHE_VERSION}`;

// Evento de instalação
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker instalado - v2.0');
    self.skipWaiting();
});

// Evento de ativação
self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker ativado');
    
    // Limpar caches antigos
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Removendo cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// Evento de Push - CRÍTICO para notificações em background
self.addEventListener('push', (event) => {
    console.log('📨 Push recebido em background:', event);
    
    let notificationData = {
        title: '🔔 Nova Atualização',
        body: 'Você tem uma nova notificação',
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        data: {
            url: '/',
            timestamp: Date.now()
        },
        actions: [
            { action: 'open', title: '📋 Abrir' },
            { action: 'close', title: '❌ Fechar' }
        ]
    };

    // Tentar extrair dados do payload
    if (event.data) {
        try {
            const payload = event.data.json();
            notificationData = {
                ...notificationData,
                ...payload,
                // Garantir que dados críticos estejam presentes
                title: payload.title || notificationData.title,
                body: payload.body || notificationData.body,
                data: {
                    ...notificationData.data,
                    ...(payload.data || {})
                }
            };
        } catch (e) {
            // Se não for JSON, usar como texto
            notificationData.body = event.data.text() || notificationData.body;
        }
    }

    // Configurações ESPECÍFICAS para iOS
    const options = {
        // Visual
        body: notificationData.body,
        icon: notificationData.icon,
        badge: notificationData.badge,
        image: notificationData.image,
        
        // Comportamento CRÍTICO para iOS
        requireInteraction: true,      // Força a notificação ficar visível
        silent: false,                 // PERMITE som (importante!)
        renotify: true,                // Re-notificar se já existir
        
        // Vibração e Som para iOS
        vibrate: [300, 200, 300, 200, 300],  // Padrão de vibração forte
        sound: '/notification-sound.mp3',     // Som personalizado (opcional)
        
        // Dados extras
        tag: notificationData.tag || 'default',
        timestamp: Date.now(),
        data: notificationData.data,
        
        // Ações (botões) - iOS suporta!
        actions: notificationData.actions || []
    };

    // Garantir que a notificação seja exibida
    event.waitUntil(
        Promise.all([
            // Mostrar notificação
            self.registration.showNotification(notificationData.title, options),
            
            // Tentar "acordar" o dispositivo (técnica para iOS)
            self.clients.matchAll({ type: 'window' }).then((clientList) => {
                clientList.forEach(client => {
                    client.postMessage({
                        type: 'BACKGROUND_NOTIFICATION',
                        payload: notificationData
                    });
                });
            })
        ])
    );
});

// Evento de clique na notificação
self.addEventListener('notificationclick', (event) => {
    console.log('👆 Notificação clicada:', event);
    
    // Fechar a notificação
    event.notification.close();
    
    // Se clicou em "Fechar", não fazer nada
    if (event.action === 'close') return;

    // URL para abrir (padrão ou da ação)
    let url = '/';
    if (event.notification.data && event.notification.data.url) {
        url = event.notification.data.url;
    }

    // Abrir ou focar janela
    event.waitUntil(
        clients.matchAll({ 
            type: 'window',
            includeUncontrolled: true 
        }).then((clientList) => {
            // Procurar por uma janela já aberta
            for (const client of clientList) {
                if (client.url.includes(url) && 'focus' in client) {
                    // Enviar mensagem para a janela
                    client.postMessage({
                        type: 'NOTIFICATION_CLICK',
                        data: event.notification.data
                    });
                    return client.focus();
                }
            }
            // Se não encontrou, abrir nova janela
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});

// Evento de fechamento da notificação
self.addEventListener('notificationclose', (event) => {
    console.log('❌ Notificação fechada:', event);
});

// Evento de subscription change
self.addEventListener('pushsubscriptionchange', (event) => {
    console.log('🔄 Subscription mudou:', event);
});

// Manter o SW ativo
self.addEventListener('message', (event) => {
    console.log('📨 Mensagem recebida no SW:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Sincronização em background (para iOS)
self.addEventListener('sync', (event) => {
    console.log('🔄 Sincronização em background:', event);
});
