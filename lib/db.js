'use strict'
const { neon } = require('@neondatabase/serverless')

let _sql = null

function getDB() {
  if (!_sql) {
    _sql = neon(process.env.DATABASE_URL)
  }
  return _sql
}

module.exports = { getDB }
