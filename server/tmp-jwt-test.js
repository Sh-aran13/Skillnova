import jwt from 'jsonwebtoken';
const token = jwt.sign({foo:1}, 'secret', { expiresIn: '900' });
console.log(jwt.decode(token));
