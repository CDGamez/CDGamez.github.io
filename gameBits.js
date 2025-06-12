// cardHandlerUI.js
(function () {
  // === CONFIG: SET YOUR SUPABASE INFO HERE ===
  const SUPABASE_URL = "https://qvuoiokplvfjjenusagl.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2dW9pb2twbHZmamplbnVzYWdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NTY1MjQsImV4cCI6MjA2NTMzMjUyNH0.3rzk3w9Ju1svH9fq3i50Ehg4Q0EfX8CQVGVH8sRCxa4";

  // Load Supabase if needed
  function loadSupabaseScript(callback) {
    if (window.supabaseJs) return callback();
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";
    script.onload = callback;
    document.head.appendChild(script);
  }

  // Inject CSS styles for modal UI
  function injectStyles() {
    if (document.getElementById("card-handler-ui-styles")) return;
    const style = document.createElement("style");
    style.id = "card-handler-ui-styles";
    style.textContent = `
      /* Modal overlay */
      .card-handler-overlay {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }
      /* Modal box */
      .card-handler-modal {
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.3);
        width: 380px;
        max-width: 90vw;
        padding: 20px 30px;
        color: #222;
      }
      /* Title */
      .card-handler-title {
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 1rem;
        text-align: center;
        color: #0d47a1;
      }
      /* Form group */
      .card-handler-group {
        margin-bottom: 1rem;
      }
      /* Label */
      .card-handler-label {
        display: block;
        margin-bottom: 0.3rem;
        font-weight: 600;
        font-size: 0.9rem;
        color: #333;
      }
      /* Input */
      .card-handler-input {
        width: 100%;
        padding: 8px 10px;
        font-size: 1rem;
        border-radius: 4px;
        border: 1px solid #ccc;
        transition: border-color 0.3s ease;
      }
      .card-handler-input:focus {
        outline: none;
        border-color: #0d47a1;
        box-shadow: 0 0 5px #0d47a1aa;
      }
      /* Button */
      .card-handler-button {
        width: 100%;
        padding: 12px;
        font-size: 1.1rem;
        font-weight: 700;
        border-radius: 5px;
        border: none;
        background-color: #0d47a1;
        color: white;
        cursor: pointer;
        transition: background-color 0.3s ease;
      }
      .card-handler-button:hover {
        background-color: #073b8a;
      }
      /* Error message */
      .card-handler-error {
        color: #d32f2f;
        font-weight: 600;
        margin-top: -0.6rem;
        margin-bottom: 1rem;
        font-size: 0.85rem;
      }
      /* Card info display */
      .card-handler-info {
        background: #e8f0fe;
        border-radius: 6px;
        padding: 15px;
        margin-bottom: 1rem;
        color: #0d47a1;
        font-family: monospace;
        white-space: pre-line;
        font-size: 1rem;
      }
      /* Horizontal buttons */
      .card-handler-flex {
        display: flex;
        gap: 10px;
      }
      .card-handler-flex > button {
        flex: 1;
      }
      /* Responsive */
      @media (max-width: 400px) {
        .card-handler-modal {
          width: 95vw;
          padding: 15px 20px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // CardHandler class
  class CardHandler {
    constructor(supabaseUrl, supabaseAnonKey) {
      this.supabase = supabaseJs.createClient(supabaseUrl, supabaseAnonKey);
    }

    generateCardNumber() {
      let parts = [];
      for (let i = 0; i < 4; i++) {
        parts.push(Math.floor(1000 + Math.random() * 9000));
      }
      return parts.join(" ");
    }

    generateExpiry() {
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = (now.getFullYear() + 4).toString().slice(2);
      return `${month}/${year}`;
    }

    async getOrCreateCard(email) {
      let { data, error } = await this.supabase
        .from("cards")
        .select("*")
        .eq("email", email)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) return data;

      const card_number = this.generateCardNumber();
      const name = "New User";
      const expiry = this.generateExpiry();
      const game_bits = 0;

      const { data: insertData, error: insertError } = await this.supabase
        .from("cards")
        .insert([{ email, card_number, name, expiry, game_bits }])
        .select()
        .single();

      if (insertError) throw insertError;

      return insertData;
    }

    async updateGameBits(email, change) {
      if (typeof change !== "number") throw new Error("Change must be a number");

      const { data: card, error } = await this.supabase
        .from("cards")
        .select("*")
        .eq("email", email)
        .single();

      if (error) throw error;

      let newBalance = card.game_bits + change;
      if (newBalance < 0) newBalance = 0;

      const { data, error: updateError } = await this.supabase
        .from("cards")
        .update({ game_bits: newBalance })
        .eq("email", email)
        .select()
        .single();

      if (updateError) throw updateError;

      return data.game_bits;
    }
  }

  // Modal UI management
  class CardHandlerUI {
    constructor(handler) {
      this.handler = handler;
      this.email = "";
      this.card = null;
      this._buildUI();
    }

    _buildUI() {
      // Overlay
      this.overlay = document.createElement("div");
      this.overlay.className = "card-handler-overlay";
      this.overlay.setAttribute("role", "dialog");
      this.overlay.setAttribute("aria-modal", "true");
      this.overlay.style.display = "none";

      // Modal box
      this.modal = document.createElement("div");
      this.modal.className = "card-handler-modal";

      // Title
      const title = document.createElement("h2");
      title.className = "card-handler-title";
      title.textContent = "GameBit Card Manager";
      this.modal.appendChild(title);

      // Container for dynamic content
      this.content = document.createElement("div");
      this.modal.appendChild(this.content);

      // Close on overlay click
      this.overlay.addEventListener("click", (e) => {
        if (e.target === this.overlay) this.close();
      });

      this.overlay.appendChild(this.modal);
      document.body.appendChild(this.overlay);
    }

    async open() {
      this.email = "";
      this.card = null;
      this._renderEmailForm();
      this._show();
    }

    _show() {
      this.overlay.style.display = "flex";
      this.modal.focus?.();
      document.body.style.overflow = "hidden";
    }

    close() {
      this.overlay.style.display = "none";
      document.body.style.overflow = "";
      this.content.innerHTML = "";
    }

    _clearContent() {
      this.content.innerHTML = "";
    }

    _renderEmailForm(errorMsg = "") {
      this._clearContent();

      const group = document.createElement("div");
      group.className = "card-handler-group";

      const label = document.createElement("label");
      label.className = "card-handler-label";
      label.setAttribute("for", "ch-email-input");
      label.textContent = "Enter your email:";

      const input = document.createElement("input");
      input.id = "ch-email-input";
      input.className = "card-handler-input";
      input.type = "email";
      input.autocomplete = "email";
      input.placeholder = "you@example.com";
      input.value = this.email;

      if (errorMsg) {
        const err = document.createElement("div");
        err.className = "card-handler-error";
        err.textContent = errorMsg;
        this.content.appendChild(err);
      }

      this.content.appendChild(label);
      this.content.appendChild(input);

      const btn = document.createElement("button");
      btn.className = "card-handler-button";
      btn.textContent = "Get Card";
      btn.addEventListener("click", async () => {
        const val = input.value.trim().toLowerCase();
        if (!val) {
          this._renderEmailForm("Email is required.");
          return;
        }
        if (!this._validateEmail(val)) {
          this._renderEmailForm("Invalid email format.");
          return;
        }
        this.email = val;
        await this._loadCard();
      });

      this.content.appendChild(btn);

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") btn.click();
      });

      input.focus();
    }

    _validateEmail(email) {
      // Simple RFC2822 email regex
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    }

    async _loadCard() {
      try {
        this._clearContent();

        const loading = document.createElement("p");
        loading.textContent = "Loading your card...";
        this.content.appendChild(loading);

        this.card = await this.handler.getOrCreateCard(this.email);
        this._renderCardInfo();
      } catch (err) {
        this._renderEmailForm("Failed to load card. Try again.");
        console.error(err);
      }
    }

    _renderCardInfo(errorMsg = "") {
      this._clearContent();

      if (errorMsg) {
        const err = document.createElement("div");
        err.className = "card-handler-error";
        err.textContent = errorMsg;
        this.content.appendChild(err);
      }

      const info = document.createElement("div");
      info.className = "card-handler-info";
      info.textContent =
        `Name: ${this.card.name}\n` +
        `Card Number: ${this.card.card_number}\n` +
        `Expiry: ${this.card.expiry}\n` +
        `GameBits: ${this.card.game_bits}`;
      this.content.appendChild(info);

      const flex = document.createElement("div");
      flex.className = "card-handler-flex";

      const addBtn = document.createElement("button");
      addBtn.className = "card-handler-button";
      addBtn.textContent = "Add GameBits";
      addBtn.addEventListener("click", () => this._promptGameBits(true));
      flex.appendChild(addBtn);

      const removeBtn = document.createElement("button");
      removeBtn.className = "card-handler-button";
      removeBtn.textContent = "Remove GameBits";
      removeBtn.addEventListener("click", () => this._promptGameBits(false));
      flex.appendChild(removeBtn);

      this.content.appendChild(flex);

      const closeBtn = document.createElement("button");
      closeBtn.className = "card-handler-button";
      closeBtn.style.marginTop = "15px";
      closeBtn.textContent = "Close";
      closeBtn.addEventListener("click", () => this.close());
      this.content.appendChild(closeBtn);
    }

    _promptGameBits(isAdd) {
      this._clearContent();

      const label = document.createElement("label");
      label.className = "card-handler-label";
      label.textContent = `${isAdd ? "Add" : "Remove"} how many GameBits?`;

      const input = document.createElement("input");
      input.className = "card-handler-input";
      input.type = "number";
      input.min = "1";
      input.placeholder = "Enter amount";
      input.autofocus = true;

      const errorDiv = document.createElement("div");
      errorDiv.className = "card-handler-error";
      errorDiv.style.display = "none";

      const submitBtn = document.createElement("button");
      submitBtn.className = "card-handler-button";
      submitBtn.textContent = isAdd ? "Add" : "Remove";

      submitBtn.addEventListener("click", async () => {
        const val = parseInt(input.value, 10);
        if (isNaN(val) || val <= 0) {
          errorDiv.textContent = "Please enter a valid positive number.";
          errorDiv.style.display = "block";
          return;
        }

        try {
          const change = isAdd ? val : -val;
          this.card.game_bits = await this.handler.updateGameBits(this.email, change);
          this._renderCardInfo();
        } catch (err) {
          errorDiv.textContent = "Failed to update GameBits. Try again.";
          errorDiv.style.display = "block";
          console.error(err);
        }
      });

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") submitBtn.click();
      });

      this.content.appendChild(label);
      this.content.appendChild(input);
      this.content.appendChild(errorDiv);
      this.content.appendChild(submitBtn);

      input.focus();
    }
  }

  // Main launcher function, globally available without params
  window.launchCardHandlerUI = function () {
    injectStyles();
    loadSupabaseScript(() => {
      const handler = new CardHandler(SUPABASE_URL, SUPABASE_ANON_KEY);
      const ui = new CardHandlerUI(handler);
      ui.open();
    });
  };
})();
