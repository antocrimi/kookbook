-- Seed demo recipes for the two seeded users.
--
-- Idempotent: matches existing rows on (user_id, title). Existing rows are
-- UPDATEd with the latest field values; missing rows are INSERTed.
-- Re-running keeps the cloud / local DB in sync with seedData.ts.
--
-- Mirror of apps/web/app/recipes/seedData.ts. Apply with:
--   supabase db query --local  --file supabase/seed_recipes.sql
--   supabase db query --linked --file supabase/seed_recipes.sql

do $do$
declare
  seed_json jsonb := $json$[
    {
      "title": "Lemony Orzo With Asparagus and Garlic Bread Crumbs",
      "source": "NYT Cooking",
      "description": "Every spoonful of this pasta has a happy jumble of lemony orzo, grassy asparagus, garlicky bread crumbs, fresh herbs and salty Parmesan. The pasta and thinly sliced asparagus cook together in the same pot, then rest in a lemony dressing while the garlic bread crumbs are toasted, so the pasta has time to absorb as much flavor as possible.",
      "default_servings": 4,
      "time_min": 20,
      "original_photo_path": "seed/lemony-orzo.webp",
      "ingredients": [
        {"raw": "Salt and black pepper", "item": "salt and black pepper"},
        {"raw": "1 cup orzo", "item": "orzo", "quantity": {"value": 1, "unit": "cup"}},
        {"raw": "1 pound asparagus, trimmed and thinly sliced on a diagonal (about ¼-inch thick)", "item": "asparagus, trimmed and thinly sliced on a diagonal", "quantity": {"value": 1, "unit": "lb"}, "note": "about ¼-inch thick"},
        {"raw": "5 tablespoons extra-virgin olive oil", "item": "extra-virgin olive oil", "quantity": {"value": 5, "unit": "tbsp"}},
        {"raw": "1 teaspoon lemon zest plus 3 tablespoons lemon juice, plus more as needed (from about 1 large lemon)", "item": "lemon zest and juice", "quantity": {"value": 1, "unit": "tsp"}, "note": "plus 3 tbsp juice, from about 1 large lemon"},
        {"raw": "½ cup panko or homemade bread crumbs", "item": "panko or homemade bread crumbs", "quantity": {"value": 0.5, "unit": "cup"}},
        {"raw": "1 small garlic clove, finely grated", "item": "garlic clove, finely grated", "quantity": {"value": 1, "unit": "clove"}},
        {"raw": "¼ cup finely grated Parmesan, plus more for serving", "item": "finely grated Parmesan", "quantity": {"value": 0.25, "unit": "cup"}, "note": "plus more for serving"},
        {"raw": "½ cup fresh dill, mint or parsley leaves (or any combination), torn if large", "item": "fresh herbs (dill, mint or parsley)", "quantity": {"value": 0.5, "unit": "cup"}, "note": "or any combination, torn if large"}
      ],
      "steps": [
        {"text": "Bring a medium pot of salted water to a boil. Add the orzo and cook until al dente according to package directions. Two minutes before the orzo is done, add the asparagus. Drain the orzo and asparagus. Wipe out and reserve the pot."},
        {"text": "While the orzo and asparagus cook, make the dressing: In a large bowl, stir together 3 tablespoons oil and the lemon zest and juice; season to taste with salt and pepper. Add the drained orzo and asparagus and toss to coat. Set aside while you toast the bread crumbs."},
        {"text": "In the reserved pot, heat the remaining 2 tablespoons oil over medium. Add the panko and cook, stirring, until golden brown, 3 to 5 minutes. Remove from heat, then stir in the garlic and season with salt and pepper."},
        {"text": "Stir the Parmesan and herbs into the orzo, taste, then season with salt, pepper and additional lemon juice, if desired. Top with the toasted bread crumbs and more Parmesan if you like. Serve warm or at room temperature."}
      ]
    },
    {
      "title": "Crispy Gnocchi With Burst Tomatoes and Mozzarella",
      "source": "NYT Cooking",
      "description": "Skip the boil — shelf-stable gnocchi pan-fry straight from the package into golden, crisp-edged pillows. Add cherry tomatoes and a few cloves of garlic to the same pan and let them collapse into a chunky sauce; finish off the heat with torn fresh mozzarella so it just melts.",
      "default_servings": 4,
      "time_min": 20,
      "original_photo_path": "seed/crispy-gnocchi.webp",
      "ingredients": [
        {"raw": "3 tablespoons extra-virgin olive oil, divided", "item": "extra-virgin olive oil", "quantity": {"value": 3, "unit": "tbsp"}, "note": "divided"},
        {"raw": "1 (1-pound) package shelf-stable potato gnocchi", "item": "shelf-stable potato gnocchi", "quantity": {"value": 1, "unit": "lb"}},
        {"raw": "Salt and black pepper", "item": "salt and black pepper"},
        {"raw": "2 pints cherry or grape tomatoes", "item": "cherry or grape tomatoes", "quantity": {"value": 2, "unit": "pint"}},
        {"raw": "4 garlic cloves, thinly sliced", "item": "garlic, thinly sliced", "quantity": {"value": 4, "unit": "clove"}},
        {"raw": "½ teaspoon red pepper flakes", "item": "red pepper flakes", "quantity": {"value": 0.5, "unit": "tsp"}},
        {"raw": "8 ounces fresh mozzarella, torn into bite-size pieces", "item": "fresh mozzarella, torn into bite-size pieces", "quantity": {"value": 8, "unit": "oz"}},
        {"raw": "½ cup fresh basil leaves, torn", "item": "fresh basil leaves, torn", "quantity": {"value": 0.5, "unit": "cup"}}
      ],
      "steps": [
        {"text": "Heat 2 tablespoons olive oil in a large nonstick skillet over medium-high. Add the gnocchi in a single layer (do not boil first) and cook, undisturbed, until golden underneath, 4 to 5 minutes. Toss and continue cooking until crisp on the outside and tender inside, 4 to 5 minutes more. Season with salt and transfer to a plate."},
        {"text": "Add the remaining 1 tablespoon olive oil to the skillet. Add the tomatoes, garlic and red pepper flakes; season with salt. Cook, stirring occasionally, until the tomatoes burst and form a chunky sauce, 6 to 8 minutes."},
        {"text": "Return the gnocchi to the skillet and toss to coat. Remove from heat."},
        {"text": "Scatter the mozzarella and basil over the top. Season with black pepper. Serve immediately."}
      ]
    },
    {
      "title": "Zucchini Pancakes",
      "source": "NYT Cooking",
      "description": "Crisp on the outside, tender inside, generously herbed — these pancakes turn an end-of-summer surplus of zucchini into something dinner-worthy. Salting and squeezing the grated zucchini is the only step that takes patience; everything else comes together in one bowl.",
      "default_servings": 4,
      "time_min": 30,
      "original_photo_path": "seed/zucchini-pancakes.jpg",
      "ingredients": [
        {"raw": "2 medium zucchini (about 1 pound), grated on the large holes of a box grater", "item": "zucchini, grated on the large holes of a box grater", "quantity": {"value": 2, "unit": "whole"}, "note": "medium, about 1 lb total"},
        {"raw": "1 teaspoon kosher salt, plus more to taste", "item": "kosher salt", "quantity": {"value": 1, "unit": "tsp"}, "note": "plus more to taste"},
        {"raw": "2 large eggs, lightly beaten", "item": "eggs, lightly beaten", "quantity": {"value": 2, "unit": "whole"}, "note": "large"},
        {"raw": "3 scallions, thinly sliced", "item": "scallions, thinly sliced", "quantity": {"value": 3, "unit": "whole"}},
        {"raw": "½ cup all-purpose flour", "item": "all-purpose flour", "quantity": {"value": 0.5, "unit": "cup"}},
        {"raw": "¼ cup grated Parmesan", "item": "grated Parmesan", "quantity": {"value": 0.25, "unit": "cup"}},
        {"raw": "2 tablespoons chopped fresh dill", "item": "fresh dill, chopped", "quantity": {"value": 2, "unit": "tbsp"}},
        {"raw": "¼ teaspoon black pepper", "item": "black pepper", "quantity": {"value": 0.25, "unit": "tsp"}},
        {"raw": "4 tablespoons olive oil, divided", "item": "olive oil", "quantity": {"value": 4, "unit": "tbsp"}, "note": "divided"},
        {"raw": "Sour cream or plain yogurt, for serving", "item": "sour cream or plain yogurt", "note": "for serving"},
        {"raw": "Lemon wedges, for serving", "item": "lemon wedges", "note": "for serving"}
      ],
      "steps": [
        {"text": "Place the grated zucchini in a colander set in the sink and toss with 1 teaspoon salt. Let drain 15 minutes, then squeeze firmly with your hands or in a clean kitchen towel to remove as much liquid as possible."},
        {"text": "In a large bowl, combine the squeezed zucchini, eggs, scallions, flour, Parmesan, dill and black pepper. Stir until just combined."},
        {"text": "Heat 2 tablespoons olive oil in a large nonstick skillet over medium. Drop heaping tablespoons of batter into the skillet, flattening slightly with the back of the spoon. Cook until golden brown on the underside, about 3 minutes. Flip and cook 2 to 3 minutes more."},
        {"text": "Transfer to a plate and repeat with the remaining oil and batter. Season with more salt to taste. Serve warm with sour cream or yogurt and lemon wedges."}
      ]
    },
    {
      "title": "Rhubarb Macaroon Tart",
      "source": "NYT Cooking",
      "description": "A buttery shortbread crust holds tart spring rhubarb under a chewy coconut-and-almond macaroon top. The contrast — crisp pastry, jammy fruit, lacy meringue-coconut crown — is what carries the whole thing.",
      "default_servings": 8,
      "time_min": 20,
      "original_photo_path": "seed/rhubarb-macaroon-tart.webp",
      "ingredients": [
        {"raw": "1¼ cups all-purpose flour, plus more for rolling", "item": "all-purpose flour", "quantity": {"value": 1.25, "unit": "cup"}, "note": "plus more for rolling", "group": "Pastry"},
        {"raw": "¼ cup granulated sugar", "item": "granulated sugar", "quantity": {"value": 0.25, "unit": "cup"}, "group": "Pastry"},
        {"raw": "¼ teaspoon salt", "item": "salt", "quantity": {"value": 0.25, "unit": "tsp"}, "group": "Pastry"},
        {"raw": "8 tablespoons cold unsalted butter, cubed", "item": "cold unsalted butter, cubed", "quantity": {"value": 8, "unit": "tbsp"}, "group": "Pastry"},
        {"raw": "1 large egg yolk", "item": "egg yolk", "quantity": {"value": 1, "unit": "whole"}, "note": "large", "group": "Pastry"},
        {"raw": "2 to 3 tablespoons ice water", "item": "ice water", "range": {"low": 2, "high": 3, "unit": "tbsp"}, "group": "Pastry"},
        {"raw": "1 pound fresh rhubarb, cut into 1-inch pieces", "item": "fresh rhubarb, cut into 1-inch pieces", "quantity": {"value": 1, "unit": "lb"}, "group": "Filling"},
        {"raw": "¾ cup granulated sugar", "item": "granulated sugar", "quantity": {"value": 0.75, "unit": "cup"}, "group": "Filling"},
        {"raw": "1 tablespoon lemon juice", "item": "lemon juice", "quantity": {"value": 1, "unit": "tbsp"}, "group": "Filling"},
        {"raw": "1 teaspoon vanilla extract", "item": "vanilla extract", "quantity": {"value": 1, "unit": "tsp"}, "group": "Filling"},
        {"raw": "2 large egg whites", "item": "egg whites", "quantity": {"value": 2, "unit": "whole"}, "note": "large", "group": "Macaroon topping"},
        {"raw": "¼ teaspoon salt", "item": "salt", "quantity": {"value": 0.25, "unit": "tsp"}, "group": "Macaroon topping"},
        {"raw": "1½ cups sweetened shredded coconut", "item": "sweetened shredded coconut", "quantity": {"value": 1.5, "unit": "cup"}, "group": "Macaroon topping"},
        {"raw": "½ cup sliced almonds", "item": "sliced almonds", "quantity": {"value": 0.5, "unit": "cup"}, "group": "Macaroon topping"}
      ],
      "steps": [
        {"text": "In a food processor, pulse the flour, sugar and salt to combine. Add the butter and pulse until coarse crumbs form. Add the egg yolk and 2 tablespoons ice water; pulse until the dough just comes together, adding more water if needed. Form into a disk, wrap and chill at least 30 minutes.", "group": "Pastry"},
        {"text": "Heat the oven to 375°F. Roll the dough on a lightly floured surface into an 11-inch round and press into a 9-inch tart pan with a removable bottom; trim excess. Prick the bottom with a fork. Line with parchment, fill with pie weights and bake 15 minutes. Remove parchment and weights and bake 5 minutes more. Let cool slightly.", "group": "Pastry"},
        {"text": "In a bowl, toss the rhubarb with the sugar, lemon juice and vanilla. Spread evenly in the cooled crust.", "group": "Filling"},
        {"text": "In a clean bowl, beat the egg whites and salt until soft peaks form. Fold in the coconut and almonds. Spoon evenly over the rhubarb.", "group": "Macaroon topping"},
        {"text": "Bake until the topping is golden and the rhubarb is bubbling, 35 to 40 minutes. Cool completely on a rack before slicing.", "group": "Macaroon topping"}
      ]
    },
    {
      "title": "Sheet-Pan Feta With Chickpeas and Tomatoes",
      "source": "NYT Cooking",
      "description": "A whole block of feta nestled into a sheet pan of chickpeas and cherry tomatoes, then roasted until the tomatoes burst and the cheese turns soft and golden at the edges. Mash everything together at the table and scoop with bread.",
      "default_servings": 4,
      "time_min": 40,
      "original_photo_path": "seed/sheet-pan-feta.webp",
      "ingredients": [
        {"raw": "2 (15-ounce) cans chickpeas, drained and rinsed", "item": "chickpeas, drained and rinsed", "quantity": {"value": 2, "unit": "whole"}, "note": "15-ounce cans"},
        {"raw": "2 pints cherry or grape tomatoes", "item": "cherry or grape tomatoes", "quantity": {"value": 2, "unit": "pint"}},
        {"raw": "1 small red onion, thinly sliced", "item": "red onion, thinly sliced", "quantity": {"value": 1, "unit": "whole"}, "note": "small"},
        {"raw": "¼ cup extra-virgin olive oil", "item": "extra-virgin olive oil", "quantity": {"value": 0.25, "unit": "cup"}},
        {"raw": "4 garlic cloves, smashed", "item": "garlic, smashed", "quantity": {"value": 4, "unit": "clove"}},
        {"raw": "1 teaspoon dried oregano", "item": "dried oregano", "quantity": {"value": 1, "unit": "tsp"}},
        {"raw": "½ teaspoon red pepper flakes", "item": "red pepper flakes", "quantity": {"value": 0.5, "unit": "tsp"}},
        {"raw": "Salt and black pepper", "item": "salt and black pepper"},
        {"raw": "8 ounces block feta, drained", "item": "block feta, drained", "quantity": {"value": 8, "unit": "oz"}},
        {"raw": "½ cup fresh parsley, dill or mint, torn", "item": "fresh herbs (parsley, dill or mint), torn", "quantity": {"value": 0.5, "unit": "cup"}},
        {"raw": "1 lemon, cut into wedges", "item": "lemon, cut into wedges", "quantity": {"value": 1, "unit": "whole"}},
        {"raw": "Crusty bread or pita, for serving", "item": "crusty bread or pita", "note": "for serving"}
      ],
      "steps": [
        {"text": "Heat the oven to 400°F. On a large rimmed sheet pan, combine the chickpeas, tomatoes, red onion, olive oil, garlic, oregano and red pepper flakes. Season generously with salt and pepper and toss to coat."},
        {"text": "Push the mixture toward the edges of the pan to make a well in the center. Place the feta block in the well."},
        {"text": "Roast until the tomatoes burst and the feta is soft and golden at the edges, 30 to 35 minutes."},
        {"text": "Mash the feta gently with a fork and stir into the chickpea-tomato mixture. Scatter the herbs over the top. Serve hot with lemon wedges and bread for scooping."}
      ]
    },
    {
      "title": "Lemon Butter Salmon With Dill",
      "source": "NYT Cooking",
      "description": "A weeknight pan-seared salmon with crackly skin and a fast garlic-lemon butter spooned over the top. The whole thing comes together in one skillet in under twenty minutes — fancy enough for company, simple enough for a Tuesday.",
      "default_servings": 4,
      "time_min": 20,
      "original_photo_path": "seed/lemon-butter-salmon.webp",
      "ingredients": [
        {"raw": "4 (6-ounce) skin-on salmon fillets", "item": "skin-on salmon fillets", "quantity": {"value": 4, "unit": "whole"}, "note": "6-ounce each"},
        {"raw": "1 teaspoon salt", "item": "salt", "quantity": {"value": 1, "unit": "tsp"}},
        {"raw": "½ teaspoon black pepper", "item": "black pepper", "quantity": {"value": 0.5, "unit": "tsp"}},
        {"raw": "1 tablespoon olive oil", "item": "olive oil", "quantity": {"value": 1, "unit": "tbsp"}},
        {"raw": "4 tablespoons unsalted butter", "item": "unsalted butter", "quantity": {"value": 4, "unit": "tbsp"}},
        {"raw": "4 garlic cloves, minced", "item": "garlic, minced", "quantity": {"value": 4, "unit": "clove"}},
        {"raw": "1 lemon, half juiced and half cut into wedges", "item": "lemon, half juiced and half cut into wedges", "quantity": {"value": 1, "unit": "whole"}},
        {"raw": "¼ cup chopped fresh dill, plus more for serving", "item": "fresh dill, chopped", "quantity": {"value": 0.25, "unit": "cup"}, "note": "plus more for serving"}
      ],
      "steps": [
        {"text": "Pat the salmon fillets dry. Season both sides with salt and pepper."},
        {"text": "Heat the olive oil in a large skillet over medium-high. Add the salmon, skin side down, and cook without moving until the skin is crisp and releases easily from the pan, 4 to 5 minutes. Flip and cook 2 to 3 minutes more, until just opaque in the center. Transfer to a plate."},
        {"text": "Reduce heat to medium. Add the butter and let melt. Add the garlic and cook, stirring, until fragrant, about 30 seconds. Stir in the lemon juice and dill."},
        {"text": "Spoon the butter sauce over the salmon. Top with extra dill and serve with lemon wedges."}
      ]
    },
    {
      "title": "Spiced Pea Stew With Yogurt",
      "source": "NYT Cooking",
      "description": "Frozen peas, a deep base of warm spices and a generous swirl of yogurt — this is the kind of stew that feels both quick and considered. Serve over basmati or scoop with flatbread; the yogurt cools, the lemon brightens, the peas keep their squeaky pop.",
      "default_servings": 4,
      "time_min": 20,
      "original_photo_path": "seed/spiced-pea-stew.webp",
      "ingredients": [
        {"raw": "3 tablespoons olive oil", "item": "olive oil", "quantity": {"value": 3, "unit": "tbsp"}},
        {"raw": "1 large yellow onion, finely chopped", "item": "yellow onion, finely chopped", "quantity": {"value": 1, "unit": "whole"}, "note": "large"},
        {"raw": "4 garlic cloves, minced", "item": "garlic, minced", "quantity": {"value": 4, "unit": "clove"}},
        {"raw": "1 (1-inch) piece fresh ginger, grated", "item": "fresh ginger, grated", "quantity": {"value": 1, "unit": "inch"}},
        {"raw": "1 jalapeño, seeded and minced", "item": "jalapeño, seeded and minced", "quantity": {"value": 1, "unit": "whole"}},
        {"raw": "1 tablespoon ground cumin", "item": "ground cumin", "quantity": {"value": 1, "unit": "tbsp"}},
        {"raw": "1 tablespoon ground coriander", "item": "ground coriander", "quantity": {"value": 1, "unit": "tbsp"}},
        {"raw": "1 teaspoon ground turmeric", "item": "ground turmeric", "quantity": {"value": 1, "unit": "tsp"}},
        {"raw": "½ teaspoon ground cinnamon", "item": "ground cinnamon", "quantity": {"value": 0.5, "unit": "tsp"}},
        {"raw": "1 (14-ounce) can crushed tomatoes", "item": "crushed tomatoes", "quantity": {"value": 1, "unit": "whole"}, "note": "14-ounce can"},
        {"raw": "1½ cups vegetable broth", "item": "vegetable broth", "quantity": {"value": 1.5, "unit": "cup"}},
        {"raw": "4 cups frozen peas", "item": "frozen peas", "quantity": {"value": 4, "unit": "cup"}},
        {"raw": "½ cup full-fat plain yogurt, plus more for serving", "item": "full-fat plain yogurt", "quantity": {"value": 0.5, "unit": "cup"}, "note": "plus more for serving"},
        {"raw": "¼ cup chopped fresh cilantro", "item": "fresh cilantro, chopped", "quantity": {"value": 0.25, "unit": "cup"}},
        {"raw": "1 lemon, juiced", "item": "lemon, juiced", "quantity": {"value": 1, "unit": "whole"}},
        {"raw": "Salt and black pepper", "item": "salt and black pepper"},
        {"raw": "Cooked basmati rice or warm flatbread, for serving", "item": "cooked basmati rice or warm flatbread", "note": "for serving"}
      ],
      "steps": [
        {"text": "Heat the olive oil in a large saucepan over medium. Add the onion and a pinch of salt. Cook, stirring occasionally, until softened and golden, 8 to 10 minutes. Add the garlic, ginger and jalapeño and cook 1 minute more."},
        {"text": "Stir in the cumin, coriander, turmeric and cinnamon and cook, stirring, until fragrant, about 30 seconds. Add the tomatoes and broth and simmer 10 minutes."},
        {"text": "Add the peas and simmer until heated through, 5 to 7 minutes."},
        {"text": "Reduce heat to low. Stir in the yogurt and cilantro. Add the lemon juice and season with salt and pepper to taste."},
        {"text": "Serve over rice or with flatbread, topped with extra yogurt and cilantro."}
      ]
    }
  ]$json$::jsonb;

  inserted_count int := 0;
  updated_count int := 0;
begin
  -- Build a per-(user, recipe) candidate set for both seeded users.
  with seeded_users as (
    select u.id as user_id, f.id as folder_id
    from auth.users u
    join public.folders f on f.user_id = u.id and f.is_inbox = true
    where u.email in ('anto@cuckoobook.com', 'kaz@cuckoobook.com')
  ),
  candidates as (
    select
      u.user_id,
      u.folder_id,
      r.recipe->>'title' as title,
      r.recipe->>'source' as source,
      r.recipe->>'description' as description,
      (r.recipe->>'default_servings')::int as default_servings,
      (r.recipe->>'time_min')::int as time_min,
      r.recipe->>'original_photo_path' as original_photo_path,
      r.recipe->'ingredients' as ingredients,
      r.recipe->'steps' as steps
    from seeded_users u, jsonb_array_elements(seed_json) as r(recipe)
  ),
  upd as (
    update public.recipes existing
    set
      source = c.source,
      description = c.description,
      default_servings = c.default_servings,
      time_min = c.time_min,
      original_photo_path = c.original_photo_path,
      ingredients = c.ingredients,
      steps = c.steps
    from candidates c
    where existing.user_id = c.user_id and existing.title = c.title
    returning 1
  )
  select count(*) into updated_count from upd;

  with seeded_users as (
    select u.id as user_id, f.id as folder_id
    from auth.users u
    join public.folders f on f.user_id = u.id and f.is_inbox = true
    where u.email in ('anto@cuckoobook.com', 'kaz@cuckoobook.com')
  ),
  candidates as (
    select
      u.user_id,
      u.folder_id,
      r.recipe->>'title' as title,
      r.recipe->>'source' as source,
      r.recipe->>'description' as description,
      (r.recipe->>'default_servings')::int as default_servings,
      (r.recipe->>'time_min')::int as time_min,
      r.recipe->>'original_photo_path' as original_photo_path,
      r.recipe->'ingredients' as ingredients,
      r.recipe->'steps' as steps
    from seeded_users u, jsonb_array_elements(seed_json) as r(recipe)
  ),
  ins as (
    insert into public.recipes (
      user_id, folder_id, title, source, description,
      default_servings, time_min, original_photo_path,
      ingredients, steps
    )
    select
      c.user_id, c.folder_id, c.title, c.source, c.description,
      c.default_servings, c.time_min, c.original_photo_path,
      c.ingredients, c.steps
    from candidates c
    where not exists (
      select 1 from public.recipes existing
      where existing.user_id = c.user_id and existing.title = c.title
    )
    returning 1
  )
  select count(*) into inserted_count from ins;

  raise notice 'seed_recipes: inserted=%, updated=%', inserted_count, updated_count;
end
$do$;
