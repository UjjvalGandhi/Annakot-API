# 📋 Generic GET API Documentation

## Base Endpoint: `POST /getData`

This is a generic API that can retrieve data from any table with optional filtering.

---

## 🔧 Generic Request Format

```json
{
  "table": "table_name",
  "filters": {
    "field_name": "value",
    "another_field": "value"
  }
}
```

**Parameters:**
- `table` (required): Name of the table to query
- `filters` (optional): Object containing field-value pairs for filtering

---

## 📊 Table-Specific Documentation

### 1. **Pradesh Table**

**Table Name:** `pradesh`

**Available Fields:**
- `pradesh_id` (INTEGER, Primary Key)
- `pradesh_eng_name` (STRING)
- `pradesh_guj_name` (STRING)
- `pradesh_old_eng_name` (STRING)
- `pradesh_new_guj_name` (STRING)
- `user_ids` (TEXT)
- `status` (ENUM: active, inactive, deleted)
- `cdt` (DATE)
- `udt` (DATE)

**Request Examples:**

```json
// Get all pradesh records
{
  "table": "pradesh"
}

// Get active pradesh records
{
  "table": "pradesh",
  "filters": {
    "status": "active"
  }
}

// Get specific pradesh by ID
{
  "table": "pradesh",
  "filters": {
    "pradesh_id": 1
  }
}

// Get pradesh by English name
{
  "table": "pradesh",
  "filters": {
    "pradesh_eng_name": "Gujarat"
  }
}
```

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "pradesh_id": 1,
      "pradesh_eng_name": "Gujarat",
      "pradesh_guj_name": "ગુજરાત",
      "pradesh_old_eng_name": "Gujarat State",
      "pradesh_new_guj_name": "ગુજરાત રાજ્ય",
      "user_ids": "1,2,3",
      "status": "active",
      "cdt": "2024-01-01T00:00:00.000Z",
      "udt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 2. **Users Table**

**Table Name:** `user`

**Available Fields:**
- `user_id` (INTEGER, Primary Key)
- `user_name` (STRING)
- `user_mobile` (STRING)
- `user_password` (STRING)
- `user_type` (ENUM: admin, user, volunteer)
- `user_role` (STRING)
- `status` (ENUM: active, inactive, deleted)
- `cdt` (DATE)
- `udt` (DATE)

**Request Examples:**

```json
// Get all users
{
  "table": "user"
}

// Get active users only
{
  "table": "user",
  "filters": {
    "status": "active"
  }
}

// Get users by mobile number
{
  "table": "user",
  "filters": {
    "user_mobile": "9876543210"
  }
}

// Get admin users
{
  "table": "user",
  "filters": {
    "user_type": "admin",
    "status": "active"
  }
}

// Get specific user by ID
{
  "table": "user",
  "filters": {
    "user_id": 1
  }
}
```

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "user_id": 1,
      "user_name": "John Doe",
      "user_mobile": "9876543210",
      "user_password": "hashed_password_here",
      "user_type": "admin",
      "user_role": "super_admin",
      "status": "active",
      "cdt": "2024-01-01T00:00:00.000Z",
      "udt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 3. **Event Table**

**Table Name:** `event`

**Available Fields:**
- `event_id` (INTEGER, Primary Key)
- `event_name` (STRING)
- `event_desc` (TEXT)
- `event_location` (STRING)
- `event_max_prasad_date` (DATE)
- `event_date` (DATE)
- `event_item_last_date` (DATE)
- `is_prasad_active` (BOOLEAN)
- `status` (ENUM: active, inactive, deleted)
- `cdt` (DATE)
- `udt` (DATE)

**Request Examples:**

```json
// Get all events
{
  "table": "event"
}

// Get active events
{
  "table": "event",
  "filters": {
    "status": "active"
  }
}

// Get events by specific date
{
  "table": "event",
  "filters": {
    "event_date": "2024-01-15"
  }
}

// Get events with active prasad
{
  "table": "event",
  "filters": {
    "is_prasad_active": true,
    "status": "active"
  }
}

// Get specific event by ID
{
  "table": "event",
  "filters": {
    "event_id": 1
  }
}
```

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "event_id": 1,
      "event_name": "Annual Festival",
      "event_desc": "Annual community festival celebration",
      "event_location": "Community Center",
      "event_max_prasad_date": "2024-01-20T00:00:00.000Z",
      "event_date": "2024-01-15T00:00:00.000Z",
      "event_item_last_date": "2024-01-10T00:00:00.000Z",
      "is_prasad_active": true,
      "status": "active",
      "cdt": "2024-01-01T00:00:00.000Z",
      "udt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 4. **Food Items Table**

**Table Name:** `foodItems`

**Available Fields:**
- `food_item_id` (INTEGER, Primary Key)
- `food_eng_name` (STRING)
- `food_guj_name` (STRING)
- `food_unit` (STRING)
- `food_image_url` (STRING)
- `food_category` (STRING)
- `food_remark` (TEXT)
- `status` (ENUM: active, inactive, deleted)
- `cdt` (DATE)
- `udt` (DATE)

**Request Examples:**

```json
// Get all food items
{
  "table": "foodItems"
}

// Get active food items
{
  "table": "foodItems",
  "filters": {
    "status": "active"
  }
}

// Get food items by category
{
  "table": "foodItems",
  "filters": {
    "food_category": "vegetables"
  }
}

// Get specific food item by ID
{
  "table": "foodItems",
  "filters": {
    "food_item_id": 1
  }
}

// Get food items by English name
{
  "table": "foodItems",
  "filters": {
    "food_eng_name": "Rice"
  }
}
```

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "food_item_id": 1,
      "food_eng_name": "Rice",
      "food_guj_name": "ચોખા",
      "food_unit": "kg",
      "food_image_url": "https://example.com/rice.jpg",
      "food_category": "grains",
      "food_remark": "Basmati rice preferred",
      "status": "active",
      "cdt": "2024-01-01T00:00:00.000Z",
      "udt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 5. **Food Stock Table**

**Table Name:** `foodStock`

**Available Fields:**
- `event_id` (INTEGER, Foreign Key)
- `pradesh_id` (INTEGER, Foreign Key)
- `food_item_id` (INTEGER, Foreign Key)
- `food_qty` (DECIMAL)
- `person_mobile` (STRING)
- `person_name` (STRING)
- `status` (ENUM: active, inactive, deleted)
- `cdt` (DATE)
- `udt` (DATE)

**Request Examples:**

```json
// Get all food stock records
{
  "table": "foodStock"
}

// Get food stock for specific event
{
  "table": "foodStock",
  "filters": {
    "event_id": 1
  }
}

// Get food stock for specific pradesh
{
  "table": "foodStock",
  "filters": {
    "pradesh_id": 1
  }
}

// Get food stock for specific food item
{
  "table": "foodStock",
  "filters": {
    "food_item_id": 1
  }
}

// Get food stock with multiple filters
{
  "table": "foodStock",
  "filters": {
    "event_id": 1,
    "pradesh_id": 1,
    "status": "active"
  }
}

// Get food stock by person mobile
{
  "table": "foodStock",
  "filters": {
    "person_mobile": "9876543210"
  }
}
```

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "event_id": 1,
      "pradesh_id": 1,
      "food_item_id": 1,
      "food_qty": 50.00,
      "person_mobile": "9876543210",
      "person_name": "John Doe",
      "status": "active",
      "cdt": "2024-01-01T00:00:00.000Z",
      "udt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 6. **Prasad Stock Table**

**Table Name:** `prasadStock`

**Available Fields:**
- `event_id` (INTEGER, Foreign Key)
- `pradesh_id` (INTEGER, Foreign Key)
- `prasad_box_qty` (DECIMAL)
- `prasad_packet_qty` (DECIMAL)
- `person_mobile` (STRING)
- `person_name` (STRING)
- `user_id` (INTEGER, Foreign Key)
- `status` (ENUM: active, inactive, deleted)
- `cdt` (DATE)
- `udt` (DATE)

**Request Examples:**

```json
// Get all prasad stock records
{
  "table": "prasadStock"
}

// Get prasad stock for specific event
{
  "table": "prasadStock",
  "filters": {
    "event_id": 1
  }
}

// Get prasad stock for specific pradesh
{
  "table": "prasadStock",
  "filters": {
    "pradesh_id": 1
  }
}

// Get prasad stock by user
{
  "table": "prasadStock",
  "filters": {
    "user_id": 1
  }
}

// Get prasad stock with multiple filters
{
  "table": "prasadStock",
  "filters": {
    "event_id": 1,
    "pradesh_id": 1,
    "status": "active"
  }
}

// Get prasad stock by person mobile
{
  "table": "prasadStock",
  "filters": {
    "person_mobile": "9876543210"
  }
}
```

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "event_id": 1,
      "pradesh_id": 1,
      "prasad_box_qty": 25.00,
      "prasad_packet_qty": 100.00,
      "person_mobile": "9876543210",
      "person_name": "John Doe",
      "user_id": 1,
      "status": "active",
      "cdt": "2024-01-01T00:00:00.000Z",
      "udt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## 🚨 Error Responses

**Table not found:**
```json
{
  "success": false,
  "message": "Table not found."
}
```

**No table provided:**
```json
{
  "success": false,
  "message": "Table name not provided."
}
```

**Invalid filters:**
```json
{
  "success": false,
  "message": "Invalid filter field: field_name"
}
```

---

## 💡 Usage Tips

1. **Always specify the table name** in the request
2. **Use filters** to narrow down results and improve performance
3. **Combine multiple filters** for precise data retrieval
4. **Check field names** exactly as they appear in the database schema
5. **Use appropriate data types** for filter values (strings, numbers, booleans, dates)
6. **Empty filters object** will return all records from the specified table

---

## 🔍 Common Filter Patterns

**Get active records:**
```json
{
  "table": "table_name",
  "filters": {
    "status": "active"
  }
}
```

**Get records by ID:**
```json
{
  "table": "table_name",
  "filters": {
    "id_field": 1
  }
}
```

**Get records by date range:**
```json
{
  "table": "table_name",
  "filters": {
    "date_field": "2024-01-15"
  }
}
```

**Get records with multiple conditions:**
```json
{
  "table": "table_name",
  "filters": {
    "field1": "value1",
    "field2": "value2",
    "status": "active"
  }
}
```
