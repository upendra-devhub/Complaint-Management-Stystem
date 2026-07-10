(function () {
    const session = window.CMS.session;
    let socket = null;
    let connectPromise = null;
    let scriptPromise = null;

    function loadSocketScript() {
        if (window.io) {
            return Promise.resolve();
        }

        if (scriptPromise) {
            return scriptPromise;
        }

        scriptPromise = new Promise(function (resolve, reject) {
            const script = document.createElement("script");
            script.src = `${session.getSocketBase()}/socket.io/socket.io.js`;
            script.onload = resolve;
            script.onerror = function () {
                reject(new Error("Unable to load realtime client"));
            };
            document.head.appendChild(script);
        });

        return scriptPromise;
    }

    async function connect() {
        if (socket && socket.connected) {
            return socket;
        }

        if (connectPromise) {
            return connectPromise;
        }

        connectPromise = loadSocketScript()
            .then(function () {
                socket = window.io(session.getSocketBase(), {
                    auth: {
                        token: session.getToken()
                    }
                });

                return new Promise(function (resolve, reject) {
                    const handleConnect = function () {
                        socket.off("connect_error", handleError);
                        resolve(socket);
                    };

                    const handleError = function () {
                        socket.off("connect", handleConnect);
                        reject(new Error("Realtime connection failed"));
                    };

                    socket.once("connect", handleConnect);
                    socket.once("connect_error", handleError);
                });
            })
            .finally(function () {
                connectPromise = null;
            });

        return connectPromise;
    }

    function on(eventName, handler) {
        connect()
            .then(function (connectedSocket) {
                connectedSocket.on(eventName, handler);
            })
            .catch(function () {
                return null;
            });

        return function () {
            if (socket) {
                socket.off(eventName, handler);
            }
        };
    }

    function onComplaintChanged(handler) {
        return on("complaint:changed", handler);
    }

    function disconnect() {
        if (socket) {
            socket.disconnect();
            socket = null;
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        if (session.getToken()) {
            connect().catch(function () {
                return null;
            });
        }
    });

    window.addEventListener("beforeunload", disconnect);

    window.CMS = window.CMS || {};
    window.CMS.realtime = {
        connect: connect,
        on: on,
        onComplaintChanged: onComplaintChanged,
        disconnect: disconnect
    };
})();
