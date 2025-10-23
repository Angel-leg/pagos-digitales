const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
require('dotenv').config();

const client = jwksClient({
  jwksUri: `https://cognito-idp.${process.env.COG_REGION}.amazonaws.com/${process.env.COG_USER_POOL_ID}/.well-known/jwks.json`
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

const jwtMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(
    token,
    getKey,
    {
      issuer: `https://cognito-idp.${process.env.COG_REGION}.amazonaws.com/${process.env.COG_USER_POOL_ID}`,
      algorithms: ['RS256'],
    },
    (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid token', error: err.message });
      }

      req.user = decoded;
      next();
    }
  );
};

module.exports = jwtMiddleware;
