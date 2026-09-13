import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '@react-navigation/native';

import Home from '../src/pages/MainTabs/Home';
import PatientProfiles from '../src/pages/MainTabs/PatientProfiles.jsx';
import DonorProfiles from '../src/pages/MainTabs/DonorProfiles';
import Settings from '../src/pages/MainTabs/Settings';

const Tab = createBottomTabNavigator();

const MainTab = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        let iconName;
        let iconNameFocused;

        if (route.name === 'Home') {
          iconName = 'home-outline';
          iconNameFocused = 'home';
        } else if (route.name === 'Patients') {
          iconName = 'virus-outline';
          iconNameFocused = 'virus';
        } else if (route.name === 'Donors') {
          iconName = 'heart-outline';
          iconNameFocused = 'heart';
        } else if (route.name === 'Settings') {
          iconName = 'cog-outline';
          iconNameFocused = 'cog';
        }

        return {
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name={focused ? iconNameFocused : iconName}
              size={24}
              color={color}
            />
          ),
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.text + '80',
          tabBarStyle: {
            height: 70,
            backgroundColor: colors.background,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            elevation: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            borderTopWidth: 0,
            paddingTop: 8,
            paddingBottom: 12,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 2,
          },
        };
      }}
      initialRouteName="Home"
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Patients" component={PatientProfiles} />
      <Tab.Screen name="Donors" component={DonorProfiles} />
      <Tab.Screen name="Settings" component={Settings} />
    </Tab.Navigator>
  );
};

export default MainTab;
