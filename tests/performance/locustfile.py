
from locust import HttpUser, between, task


class VendoAiUser(HttpUser):
    wait_time = between(1, 5)  # Wait 1-5 seconds between tasks

    def on_start(self):
        """Log in before starting tasks."""
        self.login()

    def login(self):
        """Log in to get an access token."""
        response = self.client.post(
            "/api/auth/login",
            json={"email": "demo@vendo.ai", "password": "password123"},
            name="Login",
        )
        if response.status_code == 200:
            self.token = response.json()["access_token"]
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            # If login fails, we won't be able to proceed
            self.token = None
            self.headers = {}

    @task(3)
    def health_check(self):
        """Check the health endpoint."""
        self.client.get("/health", name="Health Check")

    @task(2)
    def api_health_check(self):
        """Check the API health endpoint."""
        self.client.get("/api/health", name="API Health Check")

    @task(5)
    def get_me(self):
        """Get current user profile (requires authentication)."""
        if self.token:
            self.client.get(
                "/api/auth/me",
                headers=self.headers,
                name="Get Me",
            )
        else:
            # If we don't have a token, skip or log in again?
            # For simplicity, we'll just skip this task if not logged in.
            pass

    @task(1)
    def get_products(self):
        """Get a list of products (might be paginated)."""
        if self.token:
            self.client.get(
                "/api/products/",
                headers=self.headers,
                name="Get Products",
            )
