import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { MembersService } from '../src/members/members.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Result, ResultDocument, ResultStatus } from '../src/results/schemas/result.schema';

async function createResults() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const membersService = app.get(MembersService);
  
  // Get Result model using getModelToken
  const resultModel = app.get<Model<ResultDocument>>(getModelToken(Result.name));
  
  // Get all members to count
  const members = await membersService.getAllMembers();
  const memberCount = members.length;
  
  console.log(`📊 Found ${memberCount} members\n`);
  console.log(`🎯 Creating ${memberCount} results with ResultNumber from 1 to ${memberCount}\n`);
  
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  
  for (let i = 1; i <= memberCount; i++) {
    try {
      const resultNumber = i.toString();
      
      // Check if result with this ResultNumber already exists
      const existingResult = await resultModel.findOne({ ResultNumber: resultNumber }).exec();
      if (existingResult) {
        console.log(`⏭️  Skipped: ResultNumber ${resultNumber} (already exists)`);
        skipCount++;
        continue;
      }
      
      // Create new result
      const result = new resultModel({
        ResultNumber: resultNumber,
        Status: ResultStatus.OPEN,
      });
      
      await result.save();
      console.log(`✅ Created: ResultNumber ${resultNumber}`);
      successCount++;
    } catch (error: any) {
      console.error(`❌ Error creating ResultNumber ${i}:`, error.message);
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

createResults().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

