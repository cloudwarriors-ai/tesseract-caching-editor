#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const MEMORY_FILE = path.join(__dirname, 'project-memory.json');

class MemoryManager {
    constructor() {
        this.memory = this.loadMemory();
    }

    loadMemory() {
        try {
            if (fs.existsSync(MEMORY_FILE)) {
                const data = fs.readFileSync(MEMORY_FILE, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('Error loading memory:', error.message);
        }

        // Return default structure if file doesn't exist or is corrupted
        return {
            project: { name: 'Unknown', version: '0.0.0' },
            tasks: [],
            current_session: { tasks_completed: 0, active_tasks: [] },
            knowledge_base: { technologies: [], key_components: [], important_findings: [] },
            system_status: { containers_running: false }
        };
    }

    saveMemory() {
        try {
            fs.writeFileSync(MEMORY_FILE, JSON.stringify(this.memory, null, 2));
        } catch (error) {
            console.error('Error saving memory:', error.message);
        }
    }

    startTask(taskName, description = '') {
        const task = {
            id: `task_${Date.now()}`,
            name: taskName,
            description: description,
            status: 'in_progress',
            started_at: new Date().toISOString(),
            completed_at: null,
            duration: null
        };

        this.memory.tasks.push(task);
        this.memory.current_session.active_tasks.push(task.id);
        this.memory.last_updated = new Date().toISOString();
        this.saveMemory();

        console.log(`🧠 MEMORY: Started task "${taskName}"`);
        console.log(`   📝 Description: ${description || 'No description provided'}`);
        console.log(`   🆔 Task ID: ${task.id}`);
        console.log(`   ⏰ Started: ${task.started_at}`);

        return task.id;
    }

    completeTask(taskId, result = '') {
        const task = this.memory.tasks.find(t => t.id === taskId);
        if (!task) {
            console.error(`🧠 MEMORY: Task ${taskId} not found`);
            return false;
        }

        task.status = 'completed';
        task.completed_at = new Date().toISOString();
        task.result = result;
        task.duration = new Date(task.completed_at) - new Date(task.started_at);

        // Remove from active tasks
        this.memory.current_session.active_tasks = this.memory.current_session.active_tasks.filter(id => id !== taskId);
        this.memory.current_session.tasks_completed++;
        this.memory.last_updated = new Date().toISOString();
        this.saveMemory();

        console.log(`✅ MEMORY: Completed task "${task.name}"`);
        console.log(`   🆔 Task ID: ${task.id}`);
        console.log(`   ⏱️ Duration: ${Math.round(task.duration / 1000)}s`);
        console.log(`   📊 Result: ${result || 'Task completed successfully'}`);

        return true;
    }

    getActiveTasks() {
        return this.memory.tasks.filter(task => task.status === 'in_progress');
    }

    getCompletedTasks() {
        return this.memory.tasks.filter(task => task.status === 'completed');
    }

    getTaskSummary() {
        const active = this.getActiveTasks();
        const completed = this.getCompletedTasks();

        console.log('\n🧠 MEMORY SUMMARY:');
        console.log(`   📊 Total Tasks: ${this.memory.tasks.length}`);
        console.log(`   ✅ Completed: ${completed.length}`);
        console.log(`   🔄 Active: ${active.length}`);
        console.log(`   📈 Session Completion Rate: ${this.memory.current_session.tasks_completed}/${this.memory.tasks.length}`);

        if (active.length > 0) {
            console.log('\n🔄 ACTIVE TASKS:');
            active.forEach(task => {
                console.log(`   • ${task.name} (${task.id})`);
            });
        }

        return { active, completed, total: this.memory.tasks.length };
    }

    updateSystemStatus(updates) {
        this.memory.system_status = { ...this.memory.system_status, ...updates };
        this.memory.last_updated = new Date().toISOString();
        this.saveMemory();
    }

    addKnowledge(category, item) {
        if (!this.memory.knowledge_base[category]) {
            this.memory.knowledge_base[category] = [];
        }

        if (!this.memory.knowledge_base[category].includes(item)) {
            this.memory.knowledge_base[category].push(item);
            this.memory.last_updated = new Date().toISOString();
            this.saveMemory();
            console.log(`🧠 MEMORY: Added to ${category}: ${item}`);
        }
    }
}

// CLI Interface
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0];
    const memory = new MemoryManager();

    switch (command) {
        case 'start':
            if (args.length < 2) {
                console.log('Usage: node memory-manager.js start "Task Name" "Description"');
                process.exit(1);
            }
            memory.startTask(args[1], args[2] || '');
            break;

        case 'complete':
            if (args.length < 2) {
                console.log('Usage: node memory-manager.js complete "task_id" "result"');
                process.exit(1);
            }
            memory.completeTask(args[1], args[2] || '');
            break;

        case 'summary':
            memory.getTaskSummary();
            break;

        case 'status':
            console.log('🧠 MEMORY STATUS:');
            console.log(`   📁 Project: ${memory.memory.project.name}`);
            console.log(`   🔢 Version: ${memory.memory.project.version}`);
            console.log(`   🖥️ Frontend: ${memory.memory.system_status.containers_running ? '✅ Running' : '❌ Stopped'}`);
            console.log(`   🔄 Last Updated: ${memory.memory.last_updated}`);
            break;

        case 'knowledge':
            console.log('🧠 MEMORY KNOWLEDGE BASE:');
            Object.entries(memory.memory.knowledge_base).forEach(([category, items]) => {
                console.log(`\n📚 ${category.toUpperCase()}:`);
                items.forEach(item => console.log(`   • ${item}`));
            });
            break;

        default:
            console.log('🧠 MEMORY MANAGER COMMANDS:');
            console.log('   start "task" "description"  - Start a new task');
            console.log('   complete "task_id" "result"  - Complete a task');
            console.log('   summary                      - Show task summary');
            console.log('   status                       - Show system status');
            console.log('   knowledge                    - Show knowledge base');
            break;
    }
}

module.exports = MemoryManager;