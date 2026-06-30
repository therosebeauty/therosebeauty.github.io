
console.log('START');

var store = {
  state: {
    initState: 'NOT-DONE',
    gallery:{
      myWorkFolder: "",
      myWork: [],
      studentsWorkFolder: "",
      studentsWork: []
    },
    myWorkImageFiles: [],
    studentsWorkImageFiles: []
  }
}



const Home = Vue.component('Home', {
  template: '#home-template',
  data: function () {
    return {
      state: store.state,
      galleryDialog: false,
      selectedWorkImageFile: "",
    }
  },
  methods: {
    showStudentsWorkImage(index){
      this.selectedWorkImageFile = this.getStudentsWorkImage(index);
      this.galleryDialog = true;
    },
    getStudentsWorkImage(index){
      // console.log('getMyWorkImage', index);
      return this.state.gallery.studentsWorkFolder + this.state.gallery.studentsWork[index - 1];
    },
    showMyWorkImage(index){
      this.selectedWorkImageFile = this.getMyWorkImage(index);
      this.galleryDialog = true;
    },
    getMyWorkImage(index){
      // console.log('getMyWorkImage', index);
      return this.state.gallery.myWorkFolder + this.state.gallery.myWork[index - 1];
    }
  },
  mounted() {
    console.log('Home mounted');
  },
  created() {
    
    console.log('Home created', this.$vuetify);
  }
})

const About = Vue.component('About', {
  template: '#about-template',
  data: function () {
    return {
      state: store.state,
    }
  },
  methods: {
  },
  mounted() {
    console.log('About mounted');
  },
  created() {
    console.log('About created');
  }
})


const SectionDivider = Vue.component('section-divider', {
  template: '#section-divider-template',
  data: function () {
    return {
      state: store.state,
    }
  },
  methods: {
  },
  mounted() {
    console.log('About mounted');
  },
  created() {
    console.log('About created');
  }
})

const router = new VueRouter({
  routes: [
    { path: '/welcome', component: Home, alias: '/' },
    { path: '/about', component: About }
  ]
})


function initVue(){
  var vuetify = new Vuetify();
  vuetify.framework.theme.isDark = true;
  console.log({vuetify});

  new Vue({
    el: '#app',
    router,
    vuetify,
    data: () => ({
      leftDrawer: false,
      fab: false,
      state: {}
    }),
    methods: {
      onScroll (e) {
        if (typeof window === 'undefined') return
        const top = window.pageYOffset ||   e.target.scrollTop || 0
        this.fab = top > 20
      },
      toTop () {
        this.$vuetify.goTo(0)
      }
    },
    created: async () => {
      console.log('App created');
      
      // var data = await init();
      // console.log(data);
      // this.state = data; 
    },
    mounted: async () => {
      console.log('App mounted');
    }
  })
}

async function init(){
  // var txt = await fetch('/images/my-work-files.txt').then(r => r.text()); 
  // var myWorkImageFiles = txt.split('\n');
  // console.log({myWorkImageFiles});
  // store.state = {...(store.state), myWorkImageFiles};

  var data = await fetch('/data.json').then(r => r.json()); 
  console.log({data});
  store.state = {...(store.state), gallery: data.gallery};



  // // var data = await fetch('data.json').then(r => r.json());
  // store.state = {...(store.state), fakeList};
  initVue();
  // setTimeout(async () => {
  // },2000)
}

init();


