const { PrismaClient } = require('@naprocs/database'); const p = new PrismaClient(); p.user.findFirst().then(console.log).catch(e => console.log('Err:', e));
