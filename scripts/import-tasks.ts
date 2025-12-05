import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { readFileSync } from 'fs';
import { join } from 'path';
import { getModelToken } from '@nestjs/mongoose';
import { Task, TaskDocument, TaskType, TaskStatus } from '../src/tasks/schemas/task.schema';
import { Model } from 'mongoose';

interface TaskData {
  descriptions: string;
  TaskType: TaskType;
  Status: TaskStatus;
}

interface TasksData {
  tasks: TaskData[];
}

async function importTasks() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const taskModel = app.get<Model<TaskDocument>>(getModelToken(Task.name));

  // Read task.json file
  const filePath = join(process.cwd(), 'scripts', 'task.json');
  const fileContent = readFileSync(filePath, 'utf-8');
  
  // Parse JSON file
  const data: TasksData = JSON.parse(fileContent);
  const tasks = data.tasks;

  console.log(`📝 Found ${tasks.length} tasks to import\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const taskData of tasks) {
    try {
      // Check if task already exists (by description and TaskType)
      const existingTask = await taskModel.findOne({
        descriptions: taskData.descriptions,
        TaskType: taskData.TaskType,
      });

      if (existingTask) {
        console.log(`⏭️  Skipped: "${taskData.descriptions.substring(0, 50)}..." (already exists)`);
        skipCount++;
        continue;
      }

      // Create new task
      const newTask = new taskModel({
        descriptions: taskData.descriptions,
        TaskType: taskData.TaskType,
        Status: taskData.Status || TaskStatus.OPEN,
      });

      await newTask.save();
      console.log(`✅ Created: "${taskData.descriptions.substring(0, 50)}..." (${taskData.TaskType})`);
      successCount++;
    } catch (error: any) {
      console.error(`❌ Error creating task:`, error.message);
      errorCount++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Created: ${successCount}`);
  console.log(`   ⏭️  Skipped: ${skipCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);

  await app.close();
  process.exit(0);
}

importTasks().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

