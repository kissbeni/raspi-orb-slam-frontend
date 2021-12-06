import useWebSocket, { ReadyState } from 'react-use-websocket';

export const useTankWebsocket = (url: string) => {
  const { sendMessage, lastMessage, readyState } = useWebSocket(url);

  return {
    isReady: readyState === ReadyState.OPEN,
  };
};
