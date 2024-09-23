// script.js

// Datos de las materias primas
const materiasPrimas = {
  PURIN: { N: 5, P: 3, K: 2, precio: 50 },
  GALLINAZA: { N: 3, P: 3, K: 3, precio: 30 },
  COMPOST: { N: 2, P: 1, K: 1, precio: 20 },
  FOSFATO: { N: 0, P: 30, K: 0, precio: 40 },
  POTASA: { N: 0, P: 0, K: 20, precio: 70 },
  'HARINA DE CARNE': { N: 7, P: 4, K: 1, precio: 100 },
};

// Mapeo de materias primas a iconos
const materialIcons = {
  PURIN: '🐖',
  GALLINAZA: '🐔',
  COMPOST: '🌱',
  FOSFATO: '⚪',
  POTASA: '🌫️',
  'HARINA DE CARNE': '🍖',
};

// Función para manejar el envío del formulario de login
document.getElementById('login-form').addEventListener('submit', function(event) {
  event.preventDefault();
  const passwordInput = document.getElementById('password').value;
  const loginError = document.getElementById('login-error');

  if (passwordInput === 'maiz') {
    // Ocultar el contenedor de login y mostrar la aplicación
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';
  } else {
    loginError.textContent = 'Contraseña incorrecta. Inténtalo de nuevo.';
  }
});

// Función para manejar el envío del formulario de la calculadora
document.getElementById('formulario').addEventListener('submit', function(event) {
  event.preventDefault();

  const Nt = parseFloat(document.getElementById('nitrogeno').value);
  const Pt = parseFloat(document.getElementById('fosforo').value);
  const Kt = parseFloat(document.getElementById('potasio').value);

  const seleccionadas = [];
  const checkboxes = document.querySelectorAll('input[name="materias"]:checked');
  checkboxes.forEach((checkbox) => {
    seleccionadas.push(checkbox.value);
  });

  if (seleccionadas.length === 0) {
    alert('Por favor, selecciona al menos una materia prima.');
    return;
  }

  const resultado = calcularMezclaNPK(Nt, Pt, Kt, seleccionadas);
  mostrarResultado(resultado);
});

function calcularMezclaNPK(Nt, Pt, Kt, seleccionadas) {
  const m = seleccionadas.length;
  let mejorError = Infinity;
  let mejorCombinacion = null;

  // Incrementos de iteración
  const incremento = 5;

  if (m === 1) {
    const materia = materiasPrimas[seleccionadas[0]];
    const N_actual = materia.N;
    const P_actual = materia.P;
    const K_actual = materia.K;
    const error =
      Math.pow(N_actual - Nt, 2) +
      Math.pow(P_actual - Pt, 2) +
      Math.pow(K_actual - Kt, 2);
    mejorError = error;
    mejorCombinacion = { [seleccionadas[0]]: 100 };
  } else {
    const combinaciones = generarCombinaciones(m, incremento);
    combinaciones.forEach((proporciones) => {
      const fracs = proporciones.map((p) => p / 100);
      let N_actual = 0;
      let P_actual = 0;
      let K_actual = 0;
      for (let i = 0; i < m; i++) {
        const mat = materiasPrimas[seleccionadas[i]];
        N_actual += fracs[i] * mat.N;
        P_actual += fracs[i] * mat.P;
        K_actual += fracs[i] * mat.K;
      }
      const error =
        Math.pow(N_actual - Nt, 2) +
        Math.pow(P_actual - Pt, 2) +
        Math.pow(K_actual - Kt, 2);

      if (error < mejorError) {
        mejorError = error;
        mejorCombinacion = {};
        for (let i = 0; i < m; i++) {
          mejorCombinacion[seleccionadas[i]] = proporciones[i];
        }
      }
    });
  }

  // Cálculo del precio final y NPK obtenido
  let precioFinal = 0;
  let N_final = 0;
  let P_final = 0;
  let K_final = 0;

  for (const mat in mejorCombinacion) {
    const frac = mejorCombinacion[mat] / 100;
    precioFinal += frac * materiasPrimas[mat].precio;
    N_final += frac * materiasPrimas[mat].N;
    P_final += frac * materiasPrimas[mat].P;
    K_final += frac * materiasPrimas[mat].K;
  }

  return {
    combinacion: mejorCombinacion,
    N_final: N_final.toFixed(2),
    P_final: P_final.toFixed(2),
    K_final: K_final.toFixed(2),
    precioFinal: precioFinal.toFixed(2),
  };
}

// Función para generar todas las combinaciones posibles
function generarCombinaciones(numElementos, incremento) {
  const resultados = [];
  const maxValor = 100;
  const indices = new Array(numElementos).fill(0);

  function backtrack(indice, total) {
    if (indice === numElementos - 1) {
      indices[indice] = maxValor - total;
      if (indices[indice] >= 0 && indices[indice] <= maxValor) {
        resultados.push([...indices]);
      }
      return;
    }

    for (let i = 0; i <= maxValor - total; i += incremento) {
      indices[indice] = i;
      backtrack(indice + 1, total + i);
    }
  }

  backtrack(0, 0);
  return resultados;
}

function mostrarResultado(resultado) {
  const divResultado = document.getElementById('resultado');
  divResultado.innerHTML = '';

  const titulo = document.createElement('h2');
  titulo.textContent = 'Mejor combinación de materias primas:';
  divResultado.appendChild(titulo);

  const lista = document.createElement('ul');
  for (const mat in resultado.combinacion) {
    const item = document.createElement('li');
    const icon = materialIcons[mat] || '';
    item.textContent = `${icon} ${mat}: ${resultado.combinacion[mat].toFixed(2)}%`;
    lista.appendChild(item);
  }
  divResultado.appendChild(lista);

  const npk = document.createElement('p');
  npk.textContent = `NPK obtenido: N=${resultado.N_final}, P=${resultado.P_final}, K=${resultado.K_final}`;
  divResultado.appendChild(npk);

  const precio = document.createElement('p');
  precio.textContent = `Precio final: ${resultado.precioFinal} €/tonelada`;
  divResultado.appendChild(precio);
}