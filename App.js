import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import MainNavigator from './src/navigation/MainNavigator';

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <MainNavigator />
    </NavigationContainer>
  );
}