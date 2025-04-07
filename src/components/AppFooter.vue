<template>
  <footer class="app-footer">
    <div class="container-fluid">
      <div class="footer-content">
        <span class="copyright">© {{ new Date().getFullYear() }} Hipertensión Control</span>
        <span class="version">v1.0.0</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background-color: #2c3e50;
  color: white;
  padding: 1rem 0;
  margin-top: auto;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.copyright {
  opacity: 0.8;
}

.version {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}
</style>
