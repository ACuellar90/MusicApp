import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import CancionesScreen from '../screens/CancionesScreen';
import DetalleCancionScreen from '../screens/DetalleCancionScreen';
import TeleprompterScreen from '../screens/TeleprompterScreen';
import SetlistsScreen from '../screens/SetlistsScreen';
import AgendaScreen from '../screens/AgendaScreen';
import GruposScreen from '../screens/GruposScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function CancionesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#fff' },
        headerTintColor: '#7C3AED',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="ListaCanciones" component={CancionesScreen} options={{ title: 'Canciones' }} />
      <Stack.Screen name="DetalleCancion" component={DetalleCancionScreen} options={({ route }) => ({ title: route.params.cancion.titulo })} />
      <Stack.Screen name="Teleprompter" component={TeleprompterScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Canciones: 'musical-notes',
            Setlists: 'list',
            Agenda: 'calendar',
            Grupos: 'people',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#7C3AED',
        tabBarInactiveTintColor: '#666666',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#eee',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Canciones" component={CancionesStack} />
      <Tab.Screen name="Setlists" component={SetlistsScreen} />
      <Tab.Screen name="Agenda" component={AgendaScreen} />
      <Tab.Screen name="Grupos" component={GruposScreen} />
    </Tab.Navigator>
  );
}