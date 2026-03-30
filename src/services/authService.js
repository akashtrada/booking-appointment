import api from "./api";
import {LOGIN_EMAIL, LOGIN_KEY_PASS, LOGIN_PASSWORD} from "../constants/constantsPlus";

export function login()
{
  const formData = new FormData();
  formData.append("email", LOGIN_EMAIL);
  formData.append("password", LOGIN_PASSWORD);
  formData.append("key_pass", LOGIN_KEY_PASS);

  return api
  .post("/login", formData)
  .then((res) => res.data.data.data);
}
