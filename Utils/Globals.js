let dictionary = { };

exports.setValue = (key, value, sendEvent = true) => {
  if (sendEvent) process.send({ msg: "setValueInvoked", data: { key, value }});
  dictionary[key] = value;
}

exports.getValue = key => {
  return dictionary[key];
}

exports.deleteValue = (key, sendEvent = true) => {
  if (sendEvent) process.send({ msg: "deleteValueInvoked", data: { key } });
  delete dictionary[key];
}

exports.getDictionary = () => {
  return dictionary;
}