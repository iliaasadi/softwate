from django.test import TestCase
from django.contrib.auth import get_user_model

User = get_user_model()

class AuthFlowTests(TestCase):
    def test_signup_login_me(self):
        # signup
        res = self.client.post(
            "/api/auth/signup/",
            data='{"email":"a@test.com","password":"pass1234","first_name":"A","last_name":"B","age":20}',
            content_type="application/json",
        )
        self.assertEqual(res.status_code, 200)
        self.assertIn("access_token", res.cookies)

        # me (should be authenticated via cookie)
        res2 = self.client.get("/api/auth/me/")
        self.assertEqual(res2.status_code, 200)
        self.assertEqual(res2.json()["user"]["email"], "a@test.com")

        # logout
        res3 = self.client.post("/api/auth/logout/", data="{}", content_type="application/json")
        self.assertEqual(res3.status_code, 200)
