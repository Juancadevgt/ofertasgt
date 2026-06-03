#!/usr/bin/env node
require('dotenv').config();
const { checkAlertas } = require('../src/jobs/checkAlertas');

checkAlertas()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
