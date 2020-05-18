export default function processSend(obj) {
  if (process.send) {
    process.send(obj);
  }
}
