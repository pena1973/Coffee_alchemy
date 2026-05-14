const board = document.querySelector("#menuBoard");

function loadMenu() {
  return JSON.parse(localStorage.getItem("ca_menu") || "[]");
}

function saveMenu(items) {
  localStorage.setItem("ca_menu", JSON.stringify(items));
}

function renderMenu() {
  const items = loadMenu();

  board.innerHTML = `
    <div class="menu-table-wrap">
      <table class="menu-table">
        <thead>
          <tr>
            <th>Рецепт</th>
            <th>Приготовлено (оценка)</th>
            <th>В меню</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${
            items.length
              ? items
                  .map(
                    (item) => `
                <tr>
                  <td>
                    <strong>${item.title}</strong>
                    <span>${item.badge || "coffee craft"}</span>
                    <details>
                      <summary>Состав и шаги</summary>
                      <div class="menu-details">
                        <h3>Состав</h3>
                        <ul>${item.ingredients.map((ingredient) => `<li>${ingredient}</li>`).join("")}</ul>
                        <h3>Приготовление</h3>
                        <ol>${item.steps.map((step) => `<li>${step}</li>`).join("")}</ol>
                      </div>
                    </details>
                  </td>
                  <td>
                    <label class="table-check">
                      <input data-action="prepared" data-id="${item.id}" type="checkbox" ${item.prepared ? "checked" : ""} />
                      приготовлено
                    </label>
                    <select class="rating-select" data-action="rating" data-id="${item.id}">
                      <option value="">Без оценки</option>
                      <option value="1" ${item.rating === "1" ? "selected" : ""}>1</option>
                      <option value="2" ${item.rating === "2" ? "selected" : ""}>2</option>
                      <option value="3" ${item.rating === "3" ? "selected" : ""}>3</option>
                      <option value="4" ${item.rating === "4" ? "selected" : ""}>4</option>
                      <option value="5" ${item.rating === "5" ? "selected" : ""}>5</option>
                    </select>
                  </td>
                  <td>
                    <label class="table-check compact-check">
                      <input data-action="inMenu" data-id="${item.id}" type="checkbox" ${item.inMenu === true ? "checked" : ""} />
                    </label>
                  </td>
                  <td>
                    <button class="small-button" data-delete="${item.id}" type="button">Удалить</button>
                  </td>
                </tr>
              `,
                  )
                  .join("")
              : `
                <tr>
                  <td colspan="4">
                    <div class="menu-empty-row">
                      <strong>Меню пока пустое</strong>
                      <span>Сгенерируйте напиток и нажмите “Сохранить рецепт”, чтобы добавить его в таблицу.</span>
                      <a class="primary-link" href="index.html">Перейти к генератору</a>
                    </div>
                  </td>
                </tr>
              `
          }
        </tbody>
      </table>
    </div>
  `;
}

function updateItem(id, patch) {
  saveMenu(loadMenu().map((item) => (item.id === id ? { ...item, ...patch } : item)));
}

board.addEventListener("click", (event) => {
  const button = event.target.closest("[data-delete]");
  if (!button) return;
  saveMenu(loadMenu().filter((item) => item.id !== button.dataset.delete));
  renderMenu();
});

board.addEventListener("change", (event) => {
  const target = event.target;
  const id = target.dataset.id;
  const action = target.dataset.action;
  if (!id || !action) return;

  if (action === "prepared") updateItem(id, { prepared: target.checked });
  if (action === "inMenu") updateItem(id, { inMenu: target.checked });
  if (action === "rating") updateItem(id, { rating: target.value });
});

renderMenu();
