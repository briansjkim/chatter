export const getSender = (loggedUser, users) => {
  return users[0]._id === loggedUser._id ? users[1].name : users[0].name;
};

export const getSenderFull = (loggedUser, users) => {
  return users[0]._id === loggedUser._id ? users[1] : users[0];
};

export const isSameSender = (messages, currentMessage, i, userId) => {
  return (
    // if the current message's idx doesn't exceed the messages array length and
    i < messages.length - 1 &&
    // if the next message's sender isn't the current sender or if it isn't undefined
    (messages[i + 1].sender._id !== currentMessage.sender._id ||
      messages[i + 1].sender._id === undefined) &&
    // and if the current message is from the other user, not us/current user
    messages[i].sender._id !== userId
  );
};

export const isLastMessage = (messages, i, userId) => {
  return (
    // if the current message's idx is the last idx of the list of messages
    i === messages.length - 1 &&
    // if the last message's sender isn't equal to the current user and if the last message's sender actually exists
    messages[messages.length - 1].sender._id !== userId &&
    messages[messages.length - 1].sender._id
  );
};

export const isSameSenderMargin = (messages, currentMessage, i, userId) => {
  if (
    i < messages.length - 1 &&
    messages[i + 1].sender._id === currentMessage.sender._id &&
    messages[i].sender._id !== userId
  ) {
    return 33;
  } else if (
    (i < messages.length - 1 &&
      messages[i + 1].sender._id !== currentMessage.sender._id &&
      messages[i].sender._id !== userId) ||
    (i === messages.length - 1 && messages[i].sender._id !== userId)
  ) {
    return 0;
  } else {
    return "auto";
  }
};

export const isSameUser = (messages, currentMessage, i) => {
  return i > 0 && messages[i - 1].sender._id === currentMessage.sender._id;
};
