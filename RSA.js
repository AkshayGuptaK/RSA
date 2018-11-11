function randInt (minimum, range) {
  return Math.floor(range*Math.random()) + minimum
}

function sieveOfErastothenes (limit) { // generate a prime number sieve until limit
  let sieve = []
  sieve.push(false)
  sieve.push(false)
  for (let i=0; i<limit; i++) {
    sieve.push(true)
  }
  for (let i=2; i<=Math.sqrt(limit); i++) {
    if (sieve[i]) {
      let x
      for (let j=0; j<=(limit-i*i)/i; j++) {
        sieve[i*i + j*i] = false
      }
    }
  }
  return sieve.map((value, index) => (value) ? index : 0).filter(x => x > 0)
}

function isPrime (number, sieve) { // test if a number is prime using sieve
  for (prime of sieve) {
    if (number % prime === 0) {
      return false
    }
  } return true
}

function findPrime (number, sieve) { // find closest prime after or incl. number
  let primality = isPrime(number, sieve)
  while (!primality) {
    number += 2
    primality = isPrime(number, sieve)
  }
  return number
}

function findPublicExponent (l, sieve) { // choose a prime that's coprime to l
  let e = sieve[randInt(0, sieve.length)]
  while (l % e === 0) {
    e = sieve[randInt(0, sieve.length)]
  } 
  return e
}

function extendedEuclidean (a, b) { // return (gcd, x, y) a*x + b*y = gcd(a, b)
  if (a === 0) {
    return [b, 0, 1]
  }
  let [gcd, x, y] = extendedEuclidean(b % a, a)
  y -= x * b / (a - (b % a))
  return [gcd, y, x]
} // need to fix

function findPrivateExponent (l, public) { // find suitable private key based on chosen public key
  for (let i=1; i<l; i++) {
    if ((i * l + 1) % public === 0) {
      return (i * l + 1)/public
    }
  }
}

function computeKeys (p, q, sieve) { // compute keys from chosen primes p and q
  let n = p * q
  let l = (p-1) * (q-1)
  let public = findPublicExponent(l, sieve)
  let private = findPrivateExponent(l, public)
  return [n, public, private]
}

function moduloExponentiation (number, mod, exp) { // exponential of number in modulo arithmetic
  number = number % mod
  if (exp === 0) {
    return 1
  }
  if (exp === 1) {
    return number
  }
  if (exp % 2 === 0) {
    return moduloExponentiation(number * number, mod, exp/2)
  }
  return (number * moduloExponentiation(number * number, mod, (exp-1)/2)) % mod
}

function encrypt (message, n, publicExponent) { // encrypt a message (integer) using public key
  return moduloExponentiation(message, n, publicExponent) % n
}

function decrypt (encryptedMsg, n, privateExponent) { // decrypt a message using private key
  return moduloExponentiation(encryptedMsg, n, privateExponent) % n
}

class RSA {
  constructor (min, max) {
    let limit = Math.ceil(Math.sqrt(max))
    let minimum = Math.floor(min/2)
    let range = Math.floor(max/2) - minimum
    let sieve = sieveOfErastothenes(limit)
    let p = findPrime(2*randInt(minimum, range)+1, sieve)
    let q = findPrime(2*randInt(minimum, range)+1, sieve)
    let keys = computeKeys(p, q, sieve)
    this.keys = { 'n': keys[0], 'public': keys[1], 'private': keys[2] }
    console.log(this.keys) // debug
  }
  makeEncrypter() {
    return (message) => encrypt(message, this.keys.n, this.keys.public)
  }
  makeDecrypter() {
    return (encrypted) => decrypt(encrypted, this.keys.n, this.keys.private)
  }
}

console.log(extendedEuclidean(15, 25))

let security = new RSA(1000, 10000)
let bob = security.makeEncrypter()
let alice = security.makeDecrypter()

console.log(alice(bob(5000))) // ==> 5000