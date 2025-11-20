import React, { useState, useEffect } from 'react';
import { Clock, LogOut, Users, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL;

if (!API_URL) {
  console.error('ERROR: REACT_APP_API_URL no configurada');
}

console.log('API URL:', API_URL);

const api = {
  login: async (usuario, password) => {
    try {
      console.log('Login para:', usuario);
      const formData = new FormData();
      formData.append('action', 'login');
      formData.append('usuario', usuario);
      formData.append('password', password);
      const response = await fetch(API_URL, { method: 'POST', body: formData });
      const data = await response.json();
      console.log('Respuesta login:', data);
      return data;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  },
  
  getPersonal: async (ciudad) => {
    try {
      const url = `${API_URL}?action=getPersonal&ciudad=${encodeURIComponent(ciudad)}`;
      const response = await fetch(url);
      const data = await response.json();
      console.log('Personal recibido:', data);
      return data;
    } catch (error) {
      console.error('Error en getPersonal:', error);
      throw error;
    }
  },
  
  registrarAsistencia: async (datos) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'registrarAsistencia', ...datos })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al registrar:', error);
      throw error;
    }
  },
  
  getAsistenciasDelDia: async (ciudad, fecha) => {
    try {
      const url = `${API_URL}?action=getAsistenciasDelDia&ciudad=${encodeURIComponent(ciudad)}&fecha=${fecha}`;
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en getAsistenciasDelDia:', error);
      throw error;
    }
  }
};

function Login({ onLogin }) {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!API_URL) {
      setError('Error de configuración del sistema');
    }
  }, []);

  const handleSubmit = async () => {
    if (!usuario || !password) {
      setError('Completa todos los campos');
      return;
    }
    if (!API_URL) {
      setError('Error de configuración');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const result = await api.login(usuario, password);
      if (result.success) {
        onLogin(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Error de conexión');
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="supervisor.ciudad"
              disabled={!API_URL}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
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
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </div>
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Usuario: supervisor.quito | Contraseña: demo123</p>
        </div>
      </div>
    </div>
  );
}

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
    try {
      const [personalResult, asistenciasResult] = await Promise.all([
        api.getPersonal(user.ciudad),
        api.getAsistenciasDelDia(user.ciudad, fecha)
      ]);
      if (personalResult.success) {
        setPersonal(personalResult.data || []);
      } else {
        mostrarMensaje('Error al cargar personal', 'error');
      }
      if (asistenciasResult.success) {
        setAsistencias(asistenciasResult.data || []);
      }
    } catch (err) {
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
        mostrarMensaje('Asistencia registrada', 'success');
        setSelectedPersona(null);
        cargarDatos();
      } else {
        mostrarMensaje(result.message, 'error');
      }
    } catch (err) {
      mostrarMensaje('Error al registrar', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Clock className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Control de Asistencia</h1>
                <p className="text-sm text-gray-500">{user.ciudad}</p>
              </div>
            </div>
            <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              <LogOut size={20} />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </header>

      {mensaje && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className={`flex items-center gap-2 p-4 rounded-lg ${mensaje.tipo === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {mensaje.tipo === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span>{mensaje.texto}</span>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <Calendar className="text-indigo-600" size={24} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
              <input
                type="date"
                value={fecha}
                max={fechaHoy}
                onChange={(e) => setFecha(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-indigo-600"></div>
            <p className="mt-4 text-gray-600">Cargando...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="text-indigo-600" size={24} />
                    <h2 className="text-lg font-semibold">Personal</h2>
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
                    <p className="text-gray-500">No hay personal</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {personal.map((persona) => {
                      const yaRegistrado = asistencias.some(a => a.idPersonal === persona.id);
                      return (
                        <div
                          key={persona.id}
                          onClick={() => !yaRegistrado && setSelectedPersona(persona)}
                          className={`p-4 rounded-lg border-2 cursor-pointer ${
                            yaRegistrado
                              ? 'border-green-200 bg-green-50 cursor-not-allowed opacity-75'
                              : selectedPersona?.id === persona.id
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-gray-200 hover:border-indigo-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-800">{persona.nombre} {persona.apellido}</p>
                              <p className="text-sm text-gray-500">{persona.cargo}</p>
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

            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b bg-gray-50">
                <h2 className="text-lg font-semibold">Registrar Asistencia</h2>
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
                    <p className="text-gray-500">Selecciona una persona</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {!loading && asistencias.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="p-6 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Asistencias Registradas</h2>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {asistencias.length}
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Personal</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Entrada</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Salida</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Jornada</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Horas</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {asistencias.map((asistencia, index) => (
                    <tr key={asistencia.idRegistro} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 text-sm font-medium">{asistencia.nombreCompleto}</td>
                      <td className="px-6 py-4 text-sm font-mono">{asistencia.horaEntrada || '-'}</td>
                      <td className="px-6 py-4 text-sm font-mono">{asistencia.horaSalida || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                          asistencia.tipoJornada === '6 horas' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {asistencia.tipoJornada}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold">
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

function RegistroForm({ persona, onSubmit, onCancel }) {
  const [horaEntrada, setHoraEntrada] = useState('');
  const [horaSalida, setHoraSalida] = useState('');
  const [tipoJornada, setTipoJornada] = useState('6 horas');

  const handleSubmit = () => {
    if (!horaEntrada) {
      alert('Ingresa la hora de entrada');
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
        <p className="text-xs text-indigo-600 mt-2">ID: {persona.id}</p>
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Hora de Entrada <span className="text-red-500">*</span>
        </label>
        <input
          type="time"
          value={horaEntrada}
          onChange={(e) => setHoraEntrada(e.target.value)}
          className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-lg font-mono"
        />
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Hora de Salida</label>
        <input
          type="time"
          value={horaSalida}
          onChange={(e) => setHoraSalida(e.target.value)}
          className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-lg font-mono"
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
            className={`py-4 rounded-lg font-bold border-2 ${
              tipoJornada === '4 horas'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-700 border-gray-300'
            }`}
          >
            4 Horas
          </button>
          <button
            type="button"
            onClick={() => setTipoJornada('6 horas')}
            className={`py-4 rounded-lg font-bold border-2 ${
              tipoJornada === '6 horas'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-700 border-gray-300'
            }`}
          >
            6 Horas
          </button>
        </div>
      </div>
      <div className="flex gap-3 pt-4 border-t-2">
        <button
          onClick={onCancel}
          className="flex-1 py-3 border-2 rounded-lg font-bold text-gray-700 hover:bg-gray-100"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700"
        >
          Registrar
        </button>
      </div>
    </div>
  );
}

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