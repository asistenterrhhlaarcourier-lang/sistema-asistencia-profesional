import React, { useState, useEffect } from 'react';
import { Clock, LogOut, Users, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

// Configuración del API - Usa variable de entorno de Vercel
const API_URL = process.env.REACT_APP_API_URL;

// Verificar que la URL esté configurada
if (!API_URL) {
  console.error('❌ ERROR: REACT_APP_API_URL no está configurada');
}

console.log('🔧 API URL configurada:', API_URL);

// Servicio de API
const api = {
  login: async (usuario, password) => {
    try {
      console.log('📤 Enviando login para:', usuario);
      
      const formData = new FormData();
      formData.append('action', 'login');
      formData.append('usuario', usuario);
      formData.append('password', password);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData
      });
      
      console.log('📥 Respuesta recibida, status:', response.status);
      
      const data = await response.json();
      console.log('📊 Data:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error;
    }
  },
  
  getPersonal: async (ciudad) => {
    try {
      console.log('📤 Obteniendo personal para:', ciudad);
      
      const url = `${API_URL}?action=getPersonal&ciudad=${encodeURIComponent(ciudad)}`;
      console.log('🔗 URL:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('📊 Personal recibido:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Error en getPersonal:', error);
      throw error;
    }
  },
  
  registrarAsistencia: async (datos) => {
    try {
      console.log('📤 Registrando asistencia:', datos);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'registrarAsistencia',
          ...datos
        })
      });
      
      const data = await response.json();
      console.log('📊 Resultado:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Error en registrarAsistencia:', error);
      throw error;
    }
  },
  
  getAsistenciasDelDia: async (ciudad, fecha) => {
    try {
      console.log('📤 Obteniendo asistencias:', ciudad, fecha);
      
      const url = `${API_URL}?action=getAsistenciasDelDia&ciudad=${encodeURIComponent(ciudad)}&fecha=${fecha}`;
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('📊 Asistencias recibidas:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Error en getAsistenciasDelDia:', error);
      throw error;
    }
  }
};

// Componente Login
function Login({ onLogin }) {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!API_URL) {
      setError('Error de configuración: URL del API no configurada.');
    }
  }, []);

  const handleSubmit = async () => {
    if (!usuario || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (!API_URL) {
      setError('Error de configuración del sistema');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await api.login(usuario, password);
      
      if (result.success) {
        console.log('✅ Login exitoso');
        onLogin(result.data);
      } else {
        console.log('❌ Login fallido:', result.message);
        setError(result.message);
      }
    } catch (err) {
      console.error('❌ Error de conexión:', err);
      setError('Error de conexión. Verifica tu internet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
            <Clock className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Sistema de Asistencia</h1>
          <p className="text-gray-500 mt-2">Ingresa tus credenciales</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Usuario
            </label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="supervisor.ciudad"
              disabled={!API_URL}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="••••••••"
              disabled={!API_URL}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <XCircle size={20} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !API_URL}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Credenciales de prueba:</p>
          <p>Usuario: supervisor.quito | Contraseña: demo123</p>
        </div>
      </div>
    </div>
  );
}

// Componente Dashboard
function Dashboard({ user, onLogout }) {
  const [personal, setPersonal] = useState([]);
  const [asistencias, setAsistencias] = useState([]);
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState(null);
  
  const fechaHoy = new Date().toISOString().split('T')[0];
  const [fecha, setFecha] = useState(fechaHoy);

  useEffect(() => {
    cargarDatos();
  }, [fecha]);

  const cargarDatos = async () => {
    setLoading(true);
    console.log('🔄 Cargando datos para:', user.ciudad, fecha);
    
    try {
      const [personalResult, asistenciasResult] = await Promise.all([
        api.getPersonal(user.ciudad),
        api.getAsistenciasDelDia(user.ciudad, fecha)
      ]);

      console.log('Resultado Personal:', personalResult);
      console.log('Resultado Asistencias:', asistenciasResult);

      if (personalResult.success) {
        setPersonal(personalResult.data || []);
        console.log('✅ Personal cargado:', personalResult.data?.length || 0);
      } else {
        console.error('❌ Error al cargar personal:', personalResult.message);
        mostrarMensaje('Error al cargar personal: ' + personalResult.message, 'error');
      }
      
      if (asistenciasResult.success) {
        setAsistencias(asistenciasResult.data || []);
        console.log('✅ Asistencias cargadas:', asistenciasResult.data?.length || 0);
      }
    } catch (err) {
      console.error('❌ Error al cargar datos:', err);
      mostrarMensaje('Error al cargar datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const mostrarMensaje = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 4000);
  };

  const registrarAsistencia = async (datos) => {
    try {
      const datosCompletos = {
        ...datos,
        ciudad: user.ciudad,
        fecha: fecha,
        registradoPor: user.usuario
      };

      const result = await api.registrarAsistencia(datosCompletos);
      
      if (result.success) {
        mostrarMensaje('✓ Asistencia registrada correctamente', 'success');
        setSelectedPersona(null);
        cargarDatos();
      } else {
        mostrarMensaje(result.message, 'error');
      }
    } catch (err) {
      console.error('❌ Error al registrar:', err);
      mostrarMensaje('Error al registrar asistencia', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Clock className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Control de Asistencia</h1>
                <p className="text-sm text-gray-500">{user.ciudad} • {user.rol}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </header>

      {mensaje && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className={`flex items-center gap-2 p-4 rounded-lg shadow-sm ${
            mensaje.tipo === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {mensaje.tipo === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span className="font-medium">{mensaje.texto}</span>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
          <div className="flex items-center gap-4 flex-wrap">
            <Calendar className="text-indigo-600" size={24} />
            <div className="flex-1 min-w-64">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de registro
              </label>
              <input
                type="date"
                value={fecha}
                max={fechaHoy}
                onChange={(e) => setFecha(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="text-sm text-gray-600">
              {new Date(fecha + 'T12:00:00').toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-indigo-600"></div>
            <p className="mt-4 text-gray-600 font-medium">Cargando datos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="text-indigo-600" size={24} />
                    <h2 className="text-lg font-semibold text-gray-800">Personal</h2>
                  </div>
                  <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {personal.length}
                  </span>
                </div>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto">
                {personal.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="mx-auto text-gray-300 mb-4" size={48} />
                    <p className="text-gray-500 font-medium">No hay personal para {user.ciudad}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {personal.map((persona) => {
                      const yaRegistrado = asistencias.some(a => a.idPersonal === persona.id);
                      return (
                        <div
                          key={persona.id}
                          onClick={() => !yaRegistrado && setSelectedPersona(persona)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            yaRegistrado
                              ? 'border-green-200 bg-green-50 cursor-not-allowed opacity-75'
                              : selectedPersona?.id === persona.id
                              ? 'border-indigo-500 bg-indigo-50 cursor-pointer shadow-md'
                              : 'border-gray-200 hover:border-indigo-300 hover:shadow-sm cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800">
                                {persona.nombre} {persona.apellido}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">{persona.cargo}</p>
                            </div>
                            {yaRegistrado && (
                              <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle size={24} />
                                <span className="text-xs font-medium">Registrado</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-800">Registrar Asistencia</h2>
              </div>
              <div className="p-6">
                {selectedPersona ? (
                  <RegistroForm
                    persona={selectedPersona}
                    onSubmit={registrarAsistencia}
                    onCancel={() => setSelectedPersona(null)}
                  />
                ) : (
                  <div className="text-center py-16">
                    <Users className="mx-auto text-gray-300 mb-4" size={64} />
                    <p className="text-gray-500 font-medium">
                      Selecciona una persona
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {!loading && asistencias.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">
                  Asistencias Registradas
                </h2>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {asistencias.length}
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Personal</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Entrada</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Salida</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Jornada</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Horas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {asistencias.map((asistencia, index) => (
                    <tr key={asistencia.idRegistro} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{asistencia.nombreCompleto}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 font-mono">{asistencia.horaEntrada || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 font-mono">{asistencia.horaSalida || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                          asistencia.tipoJornada === '6 horas' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {asistencia.tipoJornada}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 font-semibold">
                        {asistencia.horasTrabajadas ? `${asistencia.horasTrabajadas.toFixed(2)}h` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Componente Formulario
function RegistroForm({ persona, onSubmit, onCancel }) {
  const [horaEntrada, setHoraEntrada] = useState('');
  const [horaSalida, setHoraSalida] = useState('');
  const [tipoJornada, setTipoJornada] = useState('6 horas');

  const handleSubmit = () => {
    if (!horaEntrada) {
      alert('Por favor ingresa la hora de entrada');
      return;
    }
    
    onSubmit({
      idPersonal: persona.id,
      nombreCompleto: `${persona.nombre} ${persona.apellido}`,
      horaEntrada,
      horaSalida,
      tipoJornada
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-5 rounded-lg border-2 border-indigo-200">
        <p className="font-bold text-gray-800 text-lg">{persona.nombre} {persona.apellido}</p>
        <p className="text-sm text-gray-600 mt-1">{persona.cargo}</p>
        <p className="text-xs text-indigo-600 mt-2 font-medium">ID: {persona.id}</p>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Hora de Entrada <span className="text-red-500">*</span>
        </label>
        <input
          type="time"
          value={horaEntrada}
          onChange={(e) => setHoraEntrada(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-lg font-mono"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Hora de Salida
        </label>
        <input
          type="time"
          value={horaSalida}
          onChange={(e) => setHoraSalida(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-lg font-mono"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-3">
          Tipo de Jornada <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setTipoJornada('4 horas')}
            className={`py-4 px-4 rounded-lg font-bold transition-all border-2 ${
              tipoJornada === '4 horas'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg'
                : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-300'
            }`}
          >
            4 Horas
          </button>
          <button
            type="button"
            onClick={() => setTipoJornada('6 horas')}
            className={`py-4 px-4 rounded-lg font-bold transition-all border-2 ${
              tipoJornada === '6 horas'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg'
                : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-300'
            }`}
          >
            6 Horas
          </button>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
        <button
          onClick={onCancel}
          className="flex-1 py-3 px-4 border-2 border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-100"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-lg"
        >
          ✓ Registrar
        </button>
      </div>
    </div>
  );
}

// App Principal
export default function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="App">
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}
