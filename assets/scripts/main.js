const { createApp, ref, computed, onMounted, onBeforeMount, unref, watch } = Vue;
const { definePreset, useConfirm} = PrimeVue;

const app = createApp({
  setup() {

    const store = useStore('riskM-1');
    const confirm = useConfirm();

    const balance = ref();
    const risk = ref();
    const sl = ref();
    const leverage = ref(1);
    const riskModePercent = ref(true);
    const isDark = ref(0);

    const confirmClearCache = (event) => {
      confirm.require({
          target: event.currentTarget,
          message: 'Are you sure you want to proceed?',
          icon: 'pi pi-exclamation-triangle',
          rejectProps: {
              label: 'Cancel',
              severity: 'secondary',
              outlined: true
          },
          acceptProps: {
              label: 'Clean & fix'
          },
          accept: () => {
            clearCache();
          },
          reject: () => {
          }
      });
  };

    const calculate = ()=>{
      let loseMoney;
      if (riskModePercent.value) {
        loseMoney = (balance.value * risk.value / 100);
      } else {
        loseMoney = (risk.value * 100) / balance.value;
      }
      const levrageRisk = (sl.value * leverage.value);
      saveData();
      return Number(((loseMoney * 100) / levrageRisk || 0).toFixed(2));
    }

    const invest = computed(calculate);

    const convert = computed(() => {
      let result;
      if (riskModePercent.value) {
        result = (balance.value * risk.value / 100);
      } else {
        result = (risk.value * 100) / balance.value;
      }
      return Number(result.toFixed(2));
    })

    const clearCache = ()=>{
      store.removeStore();
      window.location.reload();
    }

    const saveData = () => {
      store.save({
        balance: unref(balance),
        risk: unref(risk),
        sl: unref(sl),
        leverage: unref(leverage),
        riskModePercent: unref(riskModePercent),
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
        leverage.value = item.leverage;
        riskModePercent.value = item.riskModePercent;
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
      leverage,
      invest,
      toggleDarkMode,
      isDark,
      themeIcon,
      riskModePercent,
      convert,
      confirmClearCache
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

app.use(PrimeVue.ConfirmationService);

app.directive('tooltip', PrimeVue.Tooltip);

app.component('p-card', PrimeVue.Card);
app.component('p-input-text', PrimeVue.InputText);
app.component('p-input-number', PrimeVue.InputNumber);
app.component('p-button', PrimeVue.Button);
app.component('p-icon-field', PrimeVue.IconField);
app.component('p-input-icon', PrimeVue.InputIcon);
app.component('p-confirm-popup', PrimeVue.ConfirmPopup);
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