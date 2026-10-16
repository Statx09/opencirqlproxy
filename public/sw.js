self.addEventListener("push", (event) => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {
      title: "Cirql",
      body: event.data ? event.data.text() : "You have a new notification.",
    };
  }

  const title = data.title || "Cirql";
  const options = {
    body: data.body || "You have a new notification.",
    icon: data.icon || "/favicon.ico",
    badge: data.badge || "/favicon.ico",
    data: data.data || {},
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const notificationData = event.notification.data || {};
  const targetUrl = new URL("/", self.location.origin);

  if (
    notificationData.type === "incoming_call" &&
    notificationData.recordId
  ) {
    targetUrl.searchParams.set(
      "incomingMessageId",
      notificationData.recordId
    );
  }

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    }).then(async (clientList) => {
      const appClient = clientList.find(
        (client) => new URL(client.url).origin === self.location.origin
      );

      if (appClient) {
        if (
          notificationData.type === "incoming_call" &&
          notificationData.recordId
        ) {
          await appClient.navigate(targetUrl.href);
        }

        return appClient.focus();
      }

      return clients.openWindow(targetUrl.href);
    })
  );
});
