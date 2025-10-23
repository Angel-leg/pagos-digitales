import { UserManager } from 'oidc-client-ts';

const config = {
  authority: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_iheBfIEVe',
  client_id: '18dqsc4m66ii15jcfbsabkv6s',
  redirect_uri: 'http://localhost:4200/auth/callback',
  post_logout_redirect_uri: 'http://localhost:4200/',
  response_type: 'code',
  scope: 'openid email',
};

const userManager = new UserManager(config);

export function login() {
  return userManager.signinRedirect();
}

export function logout() {
  return userManager.signoutRedirect();
}

export function completeLogin() {
  return userManager.signinRedirectCallback();
}

export function getUser() {
  return userManager.getUser();
}

export default userManager;
