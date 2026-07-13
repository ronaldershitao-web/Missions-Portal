/* ==========================================
   MISSIONS PORTAL API
========================================== */

class API {

    static async post(action, data = {}) {

        try {

            const formData = new URLSearchParams();

            formData.append("action", action);

            Object.keys(data).forEach(key => {

                formData.append(key, data[key]);

            });

            const response = await fetch(
                CONFIG.WEB_APP_URL,
                {
                    method: "POST",
                    body: formData
                }
            );

            if (!response.ok) {

                throw new Error(
                    `HTTP ${response.status}`
                );

            }

            return await response.json();

        } catch (err) {

            console.error(err);

            return {

                success: false,

                message:
                    "Unable to connect to server."

            };

        }

    }

}
