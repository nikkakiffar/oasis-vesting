let balance = 100
const LOCK_PERIOD = 2
const VESTING_PERIOD = 18
const PERCENT = 10

function claim() {
  for (let epoch = 0; epoch <= VESTING_PERIOD; epoch++) {
    let pending = 0;

    if (epoch == 0) {
      pending = balance * PERCENT / 100
    } else {
      pending = balance / (VESTING_PERIOD - epoch + 1);
    }
    balance -= pending;
    console.log(`Pending: ${pending}, vest: ${VESTING_PERIOD}, epoch: ${epoch}, balance: ${balance}`)
  }
}

claim();