 // Inicializar el mapa centrado en Bolivia
        const map = L.map('map').setView([-16.5, -68.15], 6);

        // Agregar capa de mapa oscuro
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap contributors © CARTO',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);

        // Ciudades principales de Bolivia con coordenadas
        const bolivianCities = {
            'Santa Cruz': [-17.8146, -63.1560],
            'La Paz': [-16.5000, -68.1500],
            'Cochabamba': [-17.3895, -66.1568],
            'Sucre': [-19.0196, -65.2619],
            'Oruro': [-17.9632, -67.1015],
            'Potosí': [-19.5836, -65.7531],
            'Tarija': [-21.5355, -64.7296],
            'Trinidad': [-14.8336, -64.8998],
            'Cobija': [-11.0267, -68.7692]
        };

        // Datos simulados de historial de llamadas
        const callHistory = {};
        let selectedCall = null;
        let currentMarkers = [];
        let triangulationLine = null;

        // Generar historial simulado
        function generateCallHistory(phoneNumber) {
            const cities = Object.keys(bolivianCities);
            const providers = ['TIGO', 'VIVA', 'ENTEL'];
            const history = [];
            
            for (let i = 0; i < 15; i++) {
                const targetNumber = `+591 ${Math.floor(60000000 + Math.random() * 9999999)}`;
                const originCity = cities[Math.floor(Math.random() * cities.length)];
                const targetCity = cities[Math.floor(Math.random() * cities.length)];
                const provider = providers[Math.floor(Math.random() * providers.length)];
                const date = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
                const duration = Math.floor(Math.random() * 600) + 30; // 30 segundos a 10 minutos
                
                history.push({
                    targetNumber,
                    originCity,
                    targetCity,
                    provider,
                    date,
                    duration,
                    type: Math.random() > 0.5 ? 'Saliente' : 'Entrante'
                });
            }
            
            return history.sort((a, b) => b.date - a.date);
        }

        // Buscar número y mostrar historial
        function iniciarRastreo() {
            const phoneNumber = document.getElementById('phoneNumber').value.trim();
            
            if (!phoneNumber) {
                alert('Por favor ingrese un número de teléfono');
                return;
            }

            // Validar formato boliviano básico
            if (!phoneNumber.startsWith('+591') || phoneNumber.length < 12) {
                alert('Formato inválido. Use: +591 XXXXXXXX');
                return;
            }

            // Obtener configuración
            const operadora = document.getElementById('operadora').value;
            const precision = document.getElementById('precision').value;
            const tipoBusqueda = document.getElementById('tipoBusqueda').value;
            const radio = document.getElementById('radio').value;

            // Simular proceso de rastreo
            mostrarProcesoRastreo(phoneNumber, {operadora, precision, tipoBusqueda, radio});
        }

        // Mostrar proceso de rastreo
        function mostrarProcesoRastreo(phoneNumber, config) {
            // Cambiar texto del botón
            const btn = document.querySelector('.btn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '🔄 Rastreando...';
            btn.disabled = true;

            // Simular tiempo de procesamiento
            setTimeout(() => {
                // Generar historial para este número
                callHistory[phoneNumber] = generateCallHistory(phoneNumber);
                displayCallHistory(phoneNumber);
                
                // Restaurar botón
                btn.innerHTML = originalText;
                btn.disabled = false;
                
                // Actualizar estado del sistema
                actualizarEstadoSistema();
            }, 2000);
        }

        // Actualizar estado del sistema
        function actualizarEstadoSistema() {
            const ahora = new Date();
            document.getElementById('lastUpdate').textContent = 
                ahora.toLocaleTimeString('es-BO', {hour:'2-digit', minute:'2-digit'});
            
            // Simular cambios en CPU y RAM
            const cpuBar = document.querySelector('.progress-fill');
            const ramBar = document.querySelectorAll('.progress-fill')[1];
            const cpuValue = document.querySelectorAll('.status-value')[0];
            const ramValue = document.querySelectorAll('.status-value')[1];
            
            const newCpu = Math.floor(Math.random() * 20) + 70; // 70-90%
            const newRam = Math.floor(Math.random() * 30) + 50; // 50-80%
            
            cpuBar.style.width = newCpu + '%';
            ramBar.style.width = newRam + '%';
            cpuValue.textContent = newCpu + '%';
            ramValue.textContent = newRam + '%';
        }

        // Actualizar slider de radio
        document.getElementById('radio').addEventListener('input', function(e) {
            document.getElementById('radioValue').textContent = e.target.value + ' km';
        });

        // Actualizar estado del sistema cada 30 segundos
        setInterval(actualizarEstadoSistema, 30000);

        // Mostrar historial en la sidebar
        function displayCallHistory(phoneNumber) {
            const historyList = document.getElementById('historyList');
            const history = callHistory[phoneNumber];
            
            historyList.innerHTML = '';
            
            history.forEach((call, index) => {
                const callItem = document.createElement('div');
                callItem.className = 'call-item';
                callItem.onclick = () => selectCall(phoneNumber, index);
                
                const formatDate = call.date.toLocaleDateString('es-BO') + ' ' + call.date.toLocaleTimeString('es-BO', {hour: '2-digit', minute: '2-digit'});
                const formatDuration = Math.floor(call.duration / 60) + 'm ' + (call.duration % 60) + 's';
                
                callItem.innerHTML = `
                    <div class="call-number">${call.targetNumber}</div>
                    <div class="call-details">
                        📍 ${call.originCity} → ${call.targetCity}<br>
                        📡 ${call.provider} | ${call.type}<br>
                        🕒 ${formatDate}<br>
                        ⏱️ ${formatDuration}
                    </div>
                `;
                
                historyList.appendChild(callItem);
            });
        }

        // Seleccionar llamada y mostrar triangulación
        function selectCall(phoneNumber, callIndex) {
            // Limpiar selección anterior
            document.querySelectorAll('.call-item').forEach(item => {
                item.classList.remove('selected');
            });
            
            // Seleccionar nueva llamada
            const callItems = document.querySelectorAll('.call-item');
            callItems[callIndex].classList.add('selected');
            
            const call = callHistory[phoneNumber][callIndex];
            selectedCall = call;
            
            // Mostrar triangulación en el mapa
            showTriangulation(phoneNumber, call);
        }

        // Mostrar triangulación en el mapa
        function showTriangulation(originNumber, call) {
            // Limpiar marcadores anteriores
            clearMarkers();
            
            const originCoords = bolivianCities[call.originCity];
            const targetCoords = bolivianCities[call.targetCity];
            
            // Crear marcadores personalizados
            const originIcon = L.divIcon({
                className: 'custom-marker',
                html: `<div style="background: #00ff88; width: 20px; height: 20px; border-radius: 50%; border: 3px solid #000; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #000; font-weight: bold;">📱</div>`,
                iconSize: [26, 26],
                iconAnchor: [13, 13]
            });
            
            const targetIcon = L.divIcon({
                className: 'custom-marker',
                html: `<div style="background: #ff6b6b; width: 20px; height: 20px; border-radius: 50%; border: 3px solid #000; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #000; font-weight: bold;">📞</div>`,
                iconSize: [26, 26],
                iconAnchor: [13, 13]
            });
            
            // Agregar marcadores
            const originMarker = L.marker(originCoords, {icon: originIcon})
                .bindPopup(`
                    <div style="color: #00ff88;">
                        <strong>📱 Origen: ${originNumber}</strong><br>
                        📍 Ubicación: ${call.originCity}<br>
                        📡 Operador: ${call.provider}<br>
                        🗼 Torre ID: ${Math.floor(Math.random() * 1000) + 1}
                    </div>
                `)
                .addTo(map);
            
            const targetMarker = L.marker(targetCoords, {icon: targetIcon})
                .bindPopup(`
                    <div style="color: #ff6b6b;">
                        <strong>📞 Destino: ${call.targetNumber}</strong><br>
                        📍 Ubicación: ${call.targetCity}<br>
                        📡 Operador: ${call.provider}<br>
                        🗼 Torre ID: ${Math.floor(Math.random() * 1000) + 1}
                    </div>
                `)
                .addTo(map);
            
            currentMarkers.push(originMarker, targetMarker);
            
            // Crear línea de conexión
            triangulationLine = L.polyline([originCoords, targetCoords], {
                color: '#00ff88',
                weight: 3,
                opacity: 0.8,
                dashArray: '10, 10'
            }).addTo(map);
            
            // Calcular distancia
            const distance = calculateDistance(originCoords[0], originCoords[1], targetCoords[0], targetCoords[1]);
            
            // Mostrar información de triangulación
            showTriangulationInfo(call, distance);
            
            // Ajustar vista del mapa para mostrar ambos puntos
            const group = new L.featureGroup([originMarker, targetMarker]);
            map.fitBounds(group.getBounds().pad(0.1));
        }

        // Calcular distancia entre dos puntos
        function calculateDistance(lat1, lon1, lat2, lon2) {
            const R = 6371; // Radio de la Tierra en km
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                    Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return R * c;
        }

        // Mostrar información de triangulación
        function showTriangulationInfo(call, distance) {
            const triangulationInfo = document.getElementById('triangulationInfo');
            const triangulationDetails = document.getElementById('triangulationDetails');
            const distanceInfo = document.getElementById('distanceInfo');
            
            triangulationDetails.innerHTML = `
                <div><strong>Origen:</strong> ${call.originCity}</div>
                <div><strong>Destino:</strong> ${call.targetCity}</div>
                <div><strong>Operador:</strong> ${call.provider}</div>
                <div><strong>Tipo:</strong> ${call.type}</div>
            `;
            
            distanceInfo.innerHTML = `
                <div><strong>📏 Distancia:</strong> ${distance.toFixed(2)} km</div>
                <div><strong>⏱️ Latencia:</strong> ${Math.ceil(distance * 0.3)} ms</div>
                <div><strong>🛰️ Señal:</strong> ${Math.floor(Math.random() * 30) + 70} dBm</div>
            `;
            
            triangulationInfo.style.display = 'block';
        }

        // Limpiar marcadores
        function clearMarkers() {
            currentMarkers.forEach(marker => {
                map.removeLayer(marker);
            });
            currentMarkers = [];
            
            if (triangulationLine) {
                map.removeLayer(triangulationLine);
                triangulationLine = null;
            }
        }

        // Limpiar mapa
        function clearMap() {
            clearMarkers();
            document.getElementById('triangulationInfo').style.display = 'none';
            document.getElementById('historyList').innerHTML = '';
            document.getElementById('phoneNumber').value = '';
            
            // Volver a vista de Bolivia
            map.setView([-16.5, -68.15], 6);
            
            // Limpiar selección
            document.querySelectorAll('.call-item').forEach(item => {
                item.classList.remove('selected');
            });
        }

        // Agregar torres de telecomunicaciones como puntos de referencia
        function addTowerReferences() {
            const towers = [
                {name: 'Torre TIGO SC-001', coords: [-17.8146, -63.1560], provider: 'TIGO'},
                {name: 'Torre VIVA LP-001', coords: [-16.5000, -68.1500], provider: 'VIVA'},
                {name: 'Torre ENTEL CB-001', coords: [-17.3895, -66.1568], provider: 'ENTEL'},
                {name: 'Torre TIGO SC-002', coords: [-17.7539, -63.2265], provider: 'TIGO'},
                {name: 'Torre VIVA LP-002', coords: [-16.5400, -68.0700], provider: 'VIVA'}
            ];
            
            towers.forEach(tower => {
                const towerIcon = L.divIcon({
                    className: 'tower-marker',
                    html: `<div style="background: #333; width: 8px; height: 8px; border-radius: 50%; border: 2px solid #00ff88; opacity: 0.7;"></div>`,
                    iconSize: [12, 12],
                    iconAnchor: [6, 6]
                });
                
                L.marker(tower.coords, {icon: towerIcon})
                    .bindPopup(`
                        <div style="color: #00ff88; font-size: 12px;">
                            <strong>🗼 ${tower.name}</strong><br>
                            Operador: ${tower.provider}<br>
                            Estado: Activa
                        </div>
                    `)
                    .addTo(map);
            });
        }

        // Inicializar torres al cargar
        addTowerReferences();

        // Efecto de entrada
        document.addEventListener('DOMContentLoaded', function() {
            document.querySelector('.sidebar').style.transform = 'translateX(-100%)';
            document.querySelector('.sidebar').style.opacity = '0';
            
            setTimeout(() => {
                document.querySelector('.sidebar').style.transition = 'all 0.8s ease';
                document.querySelector('.sidebar').style.transform = 'translateX(0)';
                document.querySelector('.sidebar').style.opacity = '1';
            }, 500);
        });

        // Formatear entrada de número de teléfono
        document.getElementById('phoneNumber').addEventListener('input', function(e) {
            let value = e.target.value.replace(/[^\d+]/g, '');
            if (value.length > 0 && !value.startsWith('+591')) {
                if (value.startsWith('591')) {
                    value = '+' + value;
                } else if (value.startsWith('+')) {
                    // Mantener el + si ya está
                } else {
                    value = '+591' + value;
                }
            }
            e.target.value = value;
        });