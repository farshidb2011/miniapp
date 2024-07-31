const { createApp, ref, computed, onMounted, onBeforeMount, unref } = Vue;
const { definePreset } = PrimeVue;

const app = createApp({
  setup() {

    const store = useStore('riskM-1');

    const balance = ref();
    const risk = ref();
    const sl = ref();
    const levrage = ref(1);
    const isDark = ref(0);

    const invest = computed(() => {
      const loseMoney = (balance.value * risk.value / 100);
      const levrageRisk = (sl.value * levrage.value);
      saveData();
      return ((loseMoney * 100) / levrageRisk || 0).toFixed(2);
    })

    const saveData = () => {
      store.save({
        balance : unref(balance),
        risk : unref(risk),
        sl : unref(sl),
        levrage : unref(levrage)
      });
    }


    const themeIcon = computed(() => {
      return isDark.value ? 'pi-sun' : 'pi-moon';
    })

    onBeforeMount(() => {
      const item = store.get();
      if (item) {
        balance.value = item.balance;
        risk.value = item.risk;
        sl.value = item.sl;
        levrage.value = item.levrage;
      }
    })

    onMounted(() => {
      isDark.value = localStorage.getItem('dark') == 'true' ? true : false;
      if (isDark.value) {
        document.querySelector('html').classList.add('app-dark');
      }
    })

    const toggleDarkMode = () => {
      const el = document.querySelector('html');
      isDark.value = !isDark.value;
      el.classList.toggle('app-dark');
      localStorage.setItem('dark', isDark.value);
    }

    return {
      balance,
      risk,
      sl,
      levrage,
      invest,
      toggleDarkMode,
      isDark,
      themeIcon
    }
  }
});

app.use(PrimeVue.Config, {
  theme: {
    preset: PrimeVue.Themes.Aura,
    options: {
      prefix: '',
      darkModeSelector: '.app-dark',
      cssLayer: false
    }
  }
});

app.component('p-card', PrimeVue.Card);
app.component('p-input-text', PrimeVue.InputText);
app.component('p-input-number', PrimeVue.InputNumber);
app.component('p-button', PrimeVue.Button);

app.mount('#root');



function useStore(key) {
  const data = ref(JSON.parse(localStorage.getItem(key)));

  const get = () => {
    return data.value;
  }

  const save = items => {
    localStorage.setItem(key, JSON.stringify(items));
  }

  const removeStore = () => {
    localStorage.removeItem(key);
  }



  return {
    get,
    save,
    removeStore
  }
}