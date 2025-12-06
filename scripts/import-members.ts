import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { MembersService } from '../src/members/members.service';
import { readFileSync } from 'fs';
import { join } from 'path';

interface Member {
  id: string;
  name: string;
  IsAdmin: boolean
}

interface MembersData {
  members: Member[];
}

async function importMembers() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const membersService = app.get(MembersService);

  // Read members.json file
  const filePath = join(process.cwd(), 'scripts', 'members.json');
  const fileContent = readFileSync(filePath, 'utf-8');
  
  // Parse JSON file
  const data: MembersData = JSON.parse(fileContent);
  const members = data.members;

  console.log(`📝 Found ${members.length} members to import\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const member of members) {
    try {
      // Use the ID from JSON file
      const uuid = member.id;
      const name = member.name;
      
      // Check if member already exists (by name, though UUID is the unique field)
      // We'll try to create and catch ConflictException if UUID already exists
      await membersService.create(uuid, name, member.IsAdmin);
      console.log(`✅ Created: ${name} (UUID: ${uuid})`);
      successCount++;
    } catch (error: any) {
      if (error.message?.includes('already exists')) {
        console.log(`⏭️  Skipped: ${member.name} (already exists)`);
        skipCount++;
      } else {
        console.error(`❌ Error creating ${member.name}:`, error.message);
        errorCount++;
      }
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Created: ${successCount}`);
  console.log(`   ⏭️  Skipped: ${skipCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);

  await app.close();
  process.exit(0);
}

importMembers().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

