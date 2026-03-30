import api from './api';

export function login() {
  const formData = new FormData();
  formData.append('email', process.env.REACT_APP_LOGIN_EMAIL);
  formData.append('password', process.env.REACT_APP_LOGIN_PASSWORD);
  formData.append('key_pass', process.env.REACT_APP_LOGIN_KEY_PASS);

  return api
    .post('/login', formData)
    .then((res) => res.data.data.data);
}