// Base de datos mundial y de las Américas: Países -> Provincias/Estados -> Ciudades
// Ordenados alfabéticamente para Buscapet

var BuscapetLocations = window.BuscapetLocations = {
  countries: [
    {
      code: "AR",
      name: "Argentina",
      flag: "🇦🇷",
      states: [
        {
          name: "Buenos Aires",
          cities: ["La Plata", "Mar del Plata", "Bahía Blanca", "Tandil", "Quilmes", "San Isidro", "Vicente López", "Pilar", "Tigre", "Morón", "Lanús", "Avellaneda"]
        },
        {
          name: "Ciudad Autónoma de Buenos Aires (CABA)",
          cities: ["Palermo", "Recoleta", "Belgrano", "Caballito", "Almagro", "Villa Urquiza", "Flores", "San Telmo", "Nuñez", "Villa Crespo", "Colegiales", "Barracas"]
        },
        {
          name: "Catamarca",
          cities: ["San Fernando del Valle de Catamarca", "Andalgalá", "Belén", "Tinogasta", "Santa María"]
        },
        {
          name: "Chaco",
          cities: ["Resistencia", "Presidencia Roque Sáenz Peña", "Villa Ángela", "Barranqueras", "Fontana"]
        },
        {
          name: "Chubut",
          cities: ["Rawson", "Comodoro Rivadavia", "Trelew", "Puerto Madryn", "Esquel"]
        },
        {
          name: "Córdoba",
          cities: ["Córdoba Capital", "Villa Carlos Paz", "Río Cuarto", "Villa María", "San Francisco", "Alta Gracia", "Jesús María", "Río Ceballos"]
        },
        {
          name: "Corrientes",
          cities: ["Corrientes Capital", "Goya", "Paso de los Libres", "Curuzú Cuatiá", "Mercedes", "Bella Vista"]
        },
        {
          name: "Entre Ríos",
          cities: ["Paraná", "Concordia", "Gualeguaychú", "Concepción del Uruguay", "Villaguay", "Chajarí"]
        },
        {
          name: "Formosa",
          cities: ["Formosa Capital", "Clorinda", "Pirané", "El Colorado", "Las Lomitas"]
        },
        {
          name: "Jujuy",
          cities: ["San Salvador de Jujuy", "Palpalá", "San Pedro de Jujuy", "Libertador General San Martín", "Tilcara", "Humahuaca"]
        },
        {
          name: "La Pampa",
          cities: ["Santa Rosa", "General Pico", "General Acha", "Eduardo Castex", "Toay"]
        },
        {
          name: "La Rioja",
          cities: ["La Rioja Capital", "Chilecito", "Aimogasta", "Chamical", "Chepes"]
        },
        {
          name: "Mendoza",
          cities: ["Mendoza Capital", "Godoy Cruz", "Guaymallén", "Las Heras", "San Rafael", "Luján de Cuyo", "Maipú", "Rivadavia"]
        },
        {
          name: "Misiones",
          cities: ["Posadas", "Puerto Iguazú", "Oberá", "Eldorado", "Apóstoles", "San Vicente"]
        },
        {
          name: "Neuquén",
          cities: ["Neuquén Capital", "San Martín de los Andes", "Villa La Angostura", "Cutral Có", "Zapala", "Plottier"]
        },
        {
          name: "Río Negro",
          cities: ["Viedma", "San Carlos de Bariloche", "General Roca", "Cipolletti", "Villa Regina", "El Bolsón"]
        },
        {
          name: "Salta",
          cities: ["Salta Capital", "San Ramón de la Nueva Orán", "Tartagal", "General Güemes", "Cafayate", "Rosario de Lerma"]
        },
        {
          name: "San Juan",
          cities: ["San Juan Capital", "Rawson", "Rivadavia", "Chimbas", "Santa Lucía", "Caucete", "Pocito"]
        },
        {
          name: "San Luis",
          cities: ["San Luis Capital", "Villa Mercedes", "Merlo", "Juana Koslay", "La Punta"]
        },
        {
          name: "Santa Cruz",
          cities: ["Río Gallegos", "El Calafate", "Caleta Olivia", "Pico Truncado", "Puerto Deseado"]
        },
        {
          name: "Santa Fe",
          cities: ["Santa Fe Capital", "Rosario", "Rafaela", "Venado Tuerto", "Reconquista", "Santo Tomé", "Esperanza"]
        },
        {
          name: "Santiago del Estero",
          cities: ["Santiago del Estero Capital", "La Banda", "Termas de Río Hondo", "Frías", "Añatuya"]
        },
        {
          name: "Tierra del Fuego",
          cities: ["Ushuaia", "Río Grande", "Tolhuin"]
        },
        {
          name: "Tucumán",
          cities: ["San Miguel de Tucumán", "Yerba Buena", "Tafí Viejo", "Concepción", "Banda del Río Salí", "Aguilares"]
        }
      ]
    },
    {
      code: "BO",
      name: "Bolivia",
      flag: "🇧🇴",
      states: [
        { name: "La Paz", cities: ["La Paz", "El Alto", "Viacha", "Achocalla"] },
        { name: "Santa Cruz", cities: ["Santa Cruz de la Sierra", "Montero", "Warnes", "Cotoca"] },
        { name: "Cochabamba", cities: ["Cochabamba", "Quillacollo", "Sacaba", "Tiquipaya"] },
        { name: "Sucre (Chuquisaca)", cities: ["Sucre", "Monteagudo", "Camargo"] },
        { name: "Tarija", cities: ["Tarija", "Yacuiba", "Bermejo", "Villamontes"] }
      ]
    },
    {
      code: "BR",
      name: "Brasil",
      flag: "🇧🇷",
      states: [
        { name: "São Paulo", cities: ["São Paulo", "Campinas", "Guarulhos", "Santos", "Ribeirão Preto"] },
        { name: "Rio de Janeiro", cities: ["Rio de Janeiro", "Niterói", "Petrópolis", "Duque de Caxias", "Cabo Frio"] },
        { name: "Minas Gerais", cities: ["Belo Horizonte", "Uberlândia", "Ouro Preto", "Juiz de Fora"] },
        { name: "Rio Grande do Sul", cities: ["Porto Alegre", "Caxias do Sul", "Gramado", "Pelotas"] },
        { name: "Paraná", cities: ["Curitiba", "Londrina", "Maringá", "Foz do Iguaçu"] },
        { name: "Santa Catarina", cities: ["Florianópolis", "Joinville", "Blumenau", "Balneário Camboriú"] }
      ]
    },
    {
      code: "CA",
      name: "Canadá",
      flag: "🇨🇦",
      states: [
        { name: "Ontario", cities: ["Toronto", "Ottawa", "Mississauga", "Hamilton"] },
        { name: "Quebec", cities: ["Montreal", "Quebec City", "Laval", "Gatineau"] },
        { name: "British Columbia", cities: ["Vancouver", "Victoria", "Surrey", "Burnaby"] },
        { name: "Alberta", cities: ["Calgary", "Edmonton", "Red Deer", "Banff"] }
      ]
    },
    {
      code: "CL",
      name: "Chile",
      flag: "🇨🇱",
      states: [
        { name: "Región Metropolitana", cities: ["Santiago", "Providencia", "Las Condes", "Ñuñoa", "Maipú", "Puente Alto", "La Florida"] },
        { name: "Valparaíso", cities: ["Valparaíso", "Viña del Mar", "Concón", "Quilpué", "Villa Alemana"] },
        { name: "Biobío", cities: ["Concepción", "Talcahuano", "San Pedro de la Paz", "Los Ángeles"] },
        { name: "Antofagasta", cities: ["Antofagasta", "Calama", "Tocopilla"] },
        { name: "Coquimbo", cities: ["La Serena", "Coquimbo", "Ovalle"] },
        { name: "Los Lagos", cities: ["Puerto Montt", "Puerto Varas", "Osorno", "Castro"] }
      ]
    },
    {
      code: "CO",
      name: "Colombia",
      flag: "🇨🇴",
      states: [
        { name: "Bogotá D.C.", cities: ["Bogotá", "Usaquén", "Chapinero", "Suba", "Kennedy", "Teusaquillo"] },
        { name: "Antioquia", cities: ["Medellín", "Envigado", "Itagüí", "Bello", "Rionegro", "Sabaneta"] },
        { name: "Valle del Cauca", cities: ["Cali", "Palmira", "Buenaventura", "Tuluá", "Buga"] },
        { name: "Atlántico", cities: ["Barranquilla", "Soledad", "Puerto Colombia", "Malambo"] },
        { name: "Santander", cities: ["Bucaramanga", "Floridablanca", "Girón", "Piedecuesta"] },
        { name: "Bolívar", cities: ["Cartagena", "Magangué", "Turbaco", "El Carmen de Bolívar"] }
      ]
    },
    {
      code: "CR",
      name: "Costa Rica",
      flag: "🇨🇷",
      states: [
        { name: "San José", cities: ["San José", "Escazú", "Desamparados", "Santa Ana", "Curridabat"] },
        { name: "Alajuela", cities: ["Alajuela", "San Ramón", "San Carlos"] },
        { name: "Heredia", cities: ["Heredia", "Santo Domingo", "San Rafael"] }
      ]
    },
    {
      code: "EC",
      name: "Ecuador",
      flag: "🇪🇨",
      states: [
        { name: "Pichincha", cities: ["Quito", "Cumbayá", "Rumiñahui", "Sangolquí"] },
        { name: "Guayas", cities: ["Guayaquil", "Samborondón", "Durán", "Daule"] },
        { name: "Azuay", cities: ["Cuenca", "Gualaceo", "Paute"] },
        { name: "Manabí", cities: ["Manta", "Portoviejo", "Chone"] }
      ]
    },
    {
      code: "ES",
      name: "España",
      flag: "🇪🇸",
      states: [
        { name: "Comunidad de Madrid", cities: ["Madrid", "Alcalá de Henares", "Móstoles", "Getafe", "Alcobendas", "Pozuelo de Alarcón"] },
        { name: "Cataluña", cities: ["Barcelona", "L'Hospitalet de Llobregat", "Badalona", "Terrassa", "Sabadell", "Sitges"] },
        { name: "Andalucía", cities: ["Sevilla", "Málaga", "Granada", "Córdoba", "Marbella", "Cádiz"] },
        { name: "Comunidad Valenciana", cities: ["Valencia", "Alicante", "Elche", "Castellón de la Plana"] },
        { name: "País Vasco", cities: ["Bilbao", "San Sebastián", "Vitoria-Gasteiz"] },
        { name: "Galicia", cities: ["A Coruña", "Vigo", "Santiago de Compostela", "Ourense"] }
      ]
    },
    {
      code: "US",
      name: "Estados Unidos (USA)",
      flag: "🇺🇸",
      states: [
        { name: "California", cities: ["Los Angeles", "San Francisco", "San Diego", "San Jose", "Sacramento", "Long Beach", "Oakland"] },
        { name: "Florida", cities: ["Miami", "Orlando", "Tampa", "Fort Lauderdale", "Jacksonville", "Key West"] },
        { name: "New York", cities: ["New York City", "Buffalo", "Rochester", "Yonkers", "Albany", "Syracuse"] },
        { name: "Texas", cities: ["Houston", "Austin", "Dallas", "San Antonio", "Fort Worth", "El Paso"] },
        { name: "Illinois", cities: ["Chicago", "Aurora", "Naperville", "Rockford", "Springfield"] },
        { name: "Washington", cities: ["Seattle", "Spokane", "Tacoma", "Bellevue", "Olympia"] }
      ]
    },
    {
      code: "MX",
      name: "México",
      flag: "🇲🇽",
      states: [
        { name: "Ciudad de México (CDMX)", cities: ["Coyoacán", "Cuauhtémoc", "Benito Juárez", "Miguel Hidalgo", "Tlalpan", "Iztapalapa", "Polanco"] },
        { name: "Jalisco", cities: ["Guadalajara", "Zapopan", "Tlaquepaque", "Puerto Vallarta", "Tonalá"] },
        { name: "Nuevo León", cities: ["Monterrey", "San Pedro Garza García", "San Nicolás", "Guadalupe", "Apodaca"] },
        { name: "Estado de México", cities: ["Toluca", "Naucalpan", "Tlalnepantla", "Ecatepec", "Huixquilucan", "Metepec"] },
        { name: "Puebla", cities: ["Puebla de Zaragoza", "San Andrés Cholula", "Atlixco", "Tehuacán"] },
        { name: "Quintana Roo", cities: ["Cancún", "Playa del Carmen", "Tulum", "Chetumal", "Cozumel"] },
        { name: "Yucatán", cities: ["Mérida", "Progreso", "Valladolid", "Tizimín"] }
      ]
    },
    {
      code: "PA",
      name: "Panamá",
      flag: "🇵🇦",
      states: [
        { name: "Panamá", cities: ["Ciudad de Panamá", "San Miguelito", "Tocumen"] },
        { name: "Panamá Oeste", cities: ["La Chorrera", "Arraiján", "Capira"] },
        { name: "Chiriquí", cities: ["David", "Boquete", "Barú"] }
      ]
    },
    {
      code: "PY",
      name: "Paraguay",
      flag: "🇵🇾",
      states: [
        { name: "Asunción (Distrito Capital)", cities: ["Asunción"] },
        { name: "Central", cities: ["San Lorenzo", "Luque", "Lambaré", "Fernando de la Mora", "Capiatá", "Mariano Roque Alonso"] },
        { name: "Alto Paraná", cities: ["Ciudad del Este", "Hernandarias", "Presidente Franco"] },
        { name: "Itapúa", cities: ["Encarnación", "Cambyretá", "Coronel Bogado"] }
      ]
    },
    {
      code: "PE",
      name: "Perú",
      flag: "🇵🇪",
      states: [
        { name: "Lima Metropolitana", cities: ["Miraflores", "San Isidro", "Santiago de Surco", "Barranco", "La Molina", "San Borja", "Los Olivos", "San Miguel"] },
        { name: "Arequipa", cities: ["Arequipa", "Cayma", "Yanahuara", "Cerro Colorado"] },
        { name: "Cusco", cities: ["Cusco", "Wanchaq", "Santiago", "Urubamba"] },
        { name: "La Libertad", cities: ["Trujillo", "Víctor Larco", "Huanchaco"] },
        { name: "Piura", cities: ["Piura", "Sullana", "Talara", "Máncora"] }
      ]
    },
    {
      code: "UY",
      name: "Uruguay",
      flag: "🇺🇾",
      states: [
        { name: "Montevideo", cities: ["Pocitos", "Punta Carretas", "Carrasco", "Cordón", "Centro", "Malvín", "Buceo", "Parque Rodó"] },
        { name: "Maldonado", cities: ["Punta del Este", "Maldonado Capital", "Piriápolis", "San Carlos"] },
        { name: "Canelones", cities: ["Ciudad de la Costa", "Las Piedras", "Pando", "Atlántida", "Canelones Capital"] },
        { name: "Colonia", cities: ["Colonia del Sacramento", "Carmelo", "Nueva Helvecia", "Rosario"] },
        { name: "Salto", cities: ["Salto Capital", "Daymán"] }
      ]
    },
    {
      code: "VE",
      name: "Venezuela",
      flag: "🇻🇪",
      states: [
        { name: "Distrito Capital", cities: ["Caracas (Libertador)", "Chacao", "Baruta", "El Hatillo", "Sucre (Petare)"] },
        { name: "Miranda", cities: ["Los Teques", "Guarenas", "Guatire", "San Antonio de los Altos"] },
        { name: "Zulia", cities: ["Maracaibo", "San Francisco", "Cabimas"] },
        { name: "Carabobo", cities: ["Valencia", "Naguanagua", "San Diego", "Puerto Cabello"] },
        { name: "Lara", cities: ["Barquisimeto", "Cabudare", "Carora"] }
      ]
    }
  ],

  // Métodos auxiliares
  getCountries() {
    return this.countries.sort((a, b) => a.name.localeCompare(b.name));
  },

  getStatesByCountryCode(code) {
    const country = this.countries.find(c => c.code === code);
    return country ? country.states.sort((a, b) => a.name.localeCompare(b.name)) : [];
  },

  getCitiesByState(countryCode, stateName) {
    const country = this.countries.find(c => c.code === countryCode);
    if (!country) return [];
    const state = country.states.find(s => s.name === stateName);
    return state ? state.cities.sort((a, b) => a.localeCompare(b)) : [];
  },

  searchLocation(query) {
    if (!query || query.trim().length < 2) return [];
    const q = query.toLowerCase().trim();
    const results = [];

    this.countries.forEach(country => {
      country.states.forEach(state => {
        state.cities.forEach(city => {
          if (
            city.toLowerCase().includes(q) ||
            state.name.toLowerCase().includes(q) ||
            country.name.toLowerCase().includes(q)
          ) {
            results.push({
              countryCode: country.code,
              countryName: country.name,
              flag: country.flag,
              stateName: state.name,
              cityName: city,
              label: `${city}, ${state.name} (${country.flag} ${country.name})`
            });
          }
        });
      });
    });

    return results.slice(0, 10);
  }
};
