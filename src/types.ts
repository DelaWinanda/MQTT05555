export interface BrokerConfig {
  id: number;
  name: string;
  server: string;
  port: number;
  user: string;
  clientId: string;
}

export interface DashboardState {
  temperature: string;
  humidity: string;
  brokerIndex: number;
  relays: boolean[];
  variasi1: boolean;
  variasi2: boolean;
  statusBrokerMsg: string;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  logs: string[];
}

export interface CommandLog {
  id: string;
  timestamp: string;
  text: string;
  type: 'incoming' | 'system' | 'voice' | 'say';
}
