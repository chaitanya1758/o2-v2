## 📘 OpenObserve Assistant – Command Reference

This document contains all supported slash commands for working within the AI-buildable project system.

---

## 💬 `/explain` – Clarify a Concept

Used to clarify dense or abstract architectural replies.

### 🔹 How to Use
```plaintext
/explain
/explain [specific concept or message]
```

### 🔹 What Happens
1. Re-expresses prior message in plain language  
2. Adds a clear example or analogy  
3. Anchors to relevant context (e.g. RAG, prompt flow)

---

## 🧭 `/who` – Check Active Persona

Identifies the current persona responding and why.

### 🔹 How to Use
```plaintext
/who
```

### 🔹 What Happens
1. Shows who is active (e.g., Rishi, Sandeep, Yogi)  
2. Explains why they are leading  
3. Includes a one-line summary of their domain role

---

## 🛠️ `/issue` – Report Behavioral Problem

Flags role confusion, process misses, or collaboration issues.

### 🔹 How to Use
```plaintext
/issue - [describe the issue]
```

### 🔹 What Happens
1. Categorizes issue (e.g., tone, scope overstep)  
2. Suggests resolution  
3. Updates either `project_instructions.md` or `commands_reference.md` depending on which file the issue pertains to  
4. Asks for confirmation before applying

---

## 📄 `/doc` – Export Canvas or Topic Snapshot

Generates a Markdown export of the current work or a prior topic.

### 🔹 How to Use
```plaintext
/doc
/doc - [topic or label]
/doc -summary
```

### 🔹 What Happens
1. Outputs clean Markdown or summary thread  
2. Optionally includes jumpstart metadata for new threads  
3. Auto-names the file for Git sync

---

## 🆘 `/help` – List Commands

Displays all available team slash commands.

### 🔹 How to Use
```plaintext
/help
```

### 🔹 What Happens
1. Returns a short list of commands  
2. Shows what each one does

---

## 🗂️ `/files` – Manage Project Files

Views, uploads, and opens known files within the project scope.

### 🔹 How to Use
```plaintext
/files
/files - [filename]
/files - add
```

### 🔹 What Happens
1. Lists all registered canvases, docs, and assets  
2. Allows you to open any file by fuzzy match  
3. Uploads are attached to the active workspace

---

## 🧬 `/git` – Repo State Sync from ZIP

Syncs internal file structure with the latest `o2-v2.zip` archive.

### 🔹 How to Use
```plaintext
/git - [upload zip file]
```

### 🔹 What Happens
1. Extracts uploaded ZIP  
2. Rebuilds internal file index and updates `repo_index.md`  
3. Detects and reports:
   - ➕ Added files  
   - ➖ Removed files  
   - 🔁 Changed files (with content diffs for `.md`, `.ts`, etc.)
4. Outputs diffs inline for review