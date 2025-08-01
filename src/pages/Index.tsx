
import React, { useState } from 'react';
import { Power, PowerOff, Waves, Eye, Ruler, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { toast } = useToast();
  const [ledStates, setLedStates] = useState({ 1: false, 2: false, 3: false, 4: false });
  const [buzzerState, setBuzzerState] = useState(false);
  const [sensorData, setSensorData] = useState({
    ldr: '--',
    distance: '--',
    allSensors: { distance: '--', ldr: '--' }
  });
  const [loading, setLoading] = useState({
    leds: {},
    buzzer: false,
    ldr: false,
    distance: false,
    allSensors: false
  });

  const BASE_URL = "http://127.0.0.1:8000";

  const controlLED = async (led: number, state: 'on' | 'off') => {
    setLoading(prev => ({ ...prev, leds: { ...prev.leds, [led]: true } }));
    try {
      const response = await fetch(`${BASE_URL}/led/${led}/${state}`, { method: 'POST' });
      const data = await response.json();
      setLedStates(prev => ({ ...prev, [led]: state === 'on' }));
      toast({
        title: `LED ${led} ${state.toUpperCase()}`,
        description: data.result,
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to control LED ${led}`,
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setLoading(prev => ({ ...prev, leds: { ...prev.leds, [led]: false } }));
    }
  };

  const controlBuzzer = async (state: 'on' | 'off') => {
    setLoading(prev => ({ ...prev, buzzer: true }));
    try {
      const response = await fetch(`${BASE_URL}/buzzer/${state}`, { method: 'POST' });
      const data = await response.json();
      setBuzzerState(state === 'on');
      toast({
        title: `Buzzer ${state.toUpperCase()}`,
        description: data.result,
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to control buzzer",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setLoading(prev => ({ ...prev, buzzer: false }));
    }
  };

  const getLDR = async () => {
    setLoading(prev => ({ ...prev, ldr: true }));
    try {
      const response = await fetch(`${BASE_URL}/ldr`);
      const data = await response.json();
      setSensorData(prev => ({ ...prev, ldr: data.ldr_value }));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get LDR value",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setLoading(prev => ({ ...prev, ldr: false }));
    }
  };

  const getDistance = async () => {
    setLoading(prev => ({ ...prev, distance: true }));
    try {
      const response = await fetch(`${BASE_URL}/ultrasonic`);
      const data = await response.json();
      setSensorData(prev => ({ ...prev, distance: data.distance_cm }));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get distance",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setLoading(prev => ({ ...prev, distance: false }));
    }
  };

  const getAllSensorData = async () => {
    setLoading(prev => ({ ...prev, allSensors: true }));
    try {
      const response = await fetch(`${BASE_URL}/sensors`);
      const data = await response.json();
      if (data.error) {
        toast({
          title: "Sensor Error",
          description: data.raw,
          variant: "destructive",
          duration: 3000,
        });
      } else {
        setSensorData(prev => ({
          ...prev,
          allSensors: { distance: data.distance, ldr: data.ldr }
        }));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get sensor data",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setLoading(prev => ({ ...prev, allSensors: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Arduino Control Dashboard
          </h1>
          <p className="text-xl text-slate-300">Modern interface for Arduino device control</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LED Control Section */}
          <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center gap-3">
                <Power className="h-7 w-7 text-blue-400" />
                LED Control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4].map((led) => (
                <div key={led} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full transition-all duration-300 ${
                      ledStates[led] ? 'bg-green-400 shadow-lg shadow-green-400/50' : 'bg-gray-500'
                    }`} />
                    <span className="text-white font-medium">LED {led}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => controlLED(led, 'on')}
                      disabled={loading.leds[led]}
                      className="bg-green-500 hover:bg-green-600 text-white transition-all duration-200 hover:scale-105"
                      size="sm"
                    >
                      {loading.leds[led] ? '...' : 'ON'}
                    </Button>
                    <Button
                      onClick={() => controlLED(led, 'off')}
                      disabled={loading.leds[led]}
                      className="bg-red-500 hover:bg-red-600 text-white transition-all duration-200 hover:scale-105"
                      size="sm"
                    >
                      {loading.leds[led] ? '...' : 'OFF'}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Buzzer Control Section */}
          <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center gap-3">
                <Waves className="h-7 w-7 text-orange-400" />
                Buzzer Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-6 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full transition-all duration-300 ${
                    buzzerState ? 'bg-orange-400 shadow-lg shadow-orange-400/50 animate-pulse' : 'bg-gray-500'
                  }`} />
                  <span className="text-white font-medium text-lg">Buzzer Status</span>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => controlBuzzer('on')}
                    disabled={loading.buzzer}
                    className="bg-orange-500 hover:bg-orange-600 text-white transition-all duration-200 hover:scale-105"
                  >
                    {loading.buzzer ? 'Loading...' : 'Turn ON'}
                  </Button>
                  <Button
                    onClick={() => controlBuzzer('off')}
                    disabled={loading.buzzer}
                    className="bg-gray-500 hover:bg-gray-600 text-white transition-all duration-200 hover:scale-105"
                  >
                    {loading.buzzer ? 'Loading...' : 'Turn OFF'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Individual Sensor Data */}
          <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center gap-3">
                <Eye className="h-7 w-7 text-purple-400" />
                Individual Sensors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-medium">Light Sensor (LDR)</span>
                  <Button
                    onClick={getLDR}
                    disabled={loading.ldr}
                    className="bg-purple-500 hover:bg-purple-600 text-white transition-all duration-200 hover:scale-105"
                    size="sm"
                  >
                    {loading.ldr ? 'Reading...' : 'Get Value'}
                  </Button>
                </div>
                <div className="p-3 bg-white/10 rounded-lg">
                  <span className="text-2xl font-bold text-purple-300">LDR: {sensorData.ldr}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-medium flex items-center gap-2">
                    <Ruler className="h-4 w-4" />
                    Ultrasonic Distance
                  </span>
                  <Button
                    onClick={getDistance}
                    disabled={loading.distance}
                    className="bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200 hover:scale-105"
                    size="sm"
                  >
                    {loading.distance ? 'Reading...' : 'Get Distance'}
                  </Button>
                </div>
                <div className="p-3 bg-white/10 rounded-lg">
                  <span className="text-2xl font-bold text-blue-300">Distance: {sensorData.distance} cm</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Combined Sensor Data */}
          <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center gap-3">
                <Database className="h-7 w-7 text-emerald-400" />
                Combined Sensor Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white font-medium text-lg">All Sensors (JSON)</span>
                  <Button
                    onClick={getAllSensorData}
                    disabled={loading.allSensors}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white transition-all duration-200 hover:scale-105"
                  >
                    {loading.allSensors ? 'Loading...' : 'Get All Data'}
                  </Button>
                </div>
                <div className="p-4 bg-white/10 rounded-lg space-y-2">
                  <div className="text-emerald-300 font-bold">
                    Distance: {sensorData.allSensors.distance} cm
                  </div>
                  <div className="text-emerald-300 font-bold">
                    LDR: {sensorData.allSensors.ldr}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Connection Status */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white text-sm">Connected to {BASE_URL}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
