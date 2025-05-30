<template>
  <div class="guest-layout">
    <main>
      <router-view /> <!--Aquí aparece el LoginView.vue-->
    </main>
  </div>
</template>


/**
Explicacion authLayout y GuestLayout
/ (Login)
└── Usa GuestLayout
    └── <router-view /> → LoginView.vue

/dashboard (Privado)
└── Usa AuthLayout
    └── <router-view /> → DashboardView, Citas, Pacientes, etc.

*/
