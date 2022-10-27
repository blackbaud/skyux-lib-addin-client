import {
    chain,
    externalSchematic,
    Rule,
    SchematicContext,
    SchematicsException,
    Tree
  } from '@angular-devkit/schematics';
  import { join, normalize } from 'path';
  import { getWorkspace } from '@schematics/angular/utility/workspace';
  import * as ts from 'typescript';
  import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
  import { NodePackageTaskOptions } from '@angular-devkit/schematics/tasks/package-manager/options';
  
  export async function setupOptions(host: Tree, options: any): Promise<Tree> {
    const workspace = await getWorkspace(host);
    if (!options.project) {
      options.project = workspace.projects.keys().next().value;
    }
    const project = workspace.projects.get(options.project);
    if (!project) {
      throw new SchematicsException(`Invalid project name: ${options.project}`);
    }
  
    options.path = join(normalize(project.root), 'src');
    return host;
  }
  
  export function myComponent(_options: any): Rule {
    return async (tree: Tree, _context: SchematicContext) => {
      await setupOptions(tree, _options);
  
      //const movePath = normalize(_options.path + '/');
      const installAddinClientServiceRule = installAddinClientService();
      const installSKYUXPackagesRule = installSKYUXPackages();
      //const templateSource = apply(url('./files/src'), [
      //  template({..._options}),
      //  move(movePath)
      //]);
  
      return chain([installAddinClientServiceRule, 
        installSKYUXPackagesRule,
        externalSchematic('@skyux/packages', 'ng-add', {})]);
    };
  }
  
  function getAsSourceFile(tree: Tree, path: string): ts.SourceFile {
    const file = tree.read(path);
    if (!file) {
      throw new SchematicsException(`${path} not found`);
    }
    return ts.createSourceFile(
      path,
      file.toString(),
      ts.ScriptTarget.Latest,
      true
    );
  }
  
  function installAddinClientService(): Rule {
    return (tree: Tree, _context: SchematicContext): Tree => {
      const addinClientPackageName = '@blackbaud/skyux-lib-addin-client';
      _context.logger.info('Installing add-in client service');
  
      if (!isPackageInstalled(addinClientPackageName, tree, _context)) {
        const options = <NodePackageTaskOptions>{
          packageName: addinClientPackageName
        };
        _context.addTask(new NodePackageInstallTask(options));
      }
  
      return tree;
    }
  }
  
  function installSKYUXPackages(): Rule {
    return (tree: Tree, _context: SchematicContext): Tree => {
      const skyuxPackageName = '@skyux/indicators';
      _context.logger.info('Installing SKY UX Indicators package');
  
      if (!isPackageInstalled(skyuxPackageName, tree, _context)) {
        const options = <NodePackageTaskOptions>{
          packageName: skyuxPackageName
        };
        _context.addTask(new NodePackageInstallTask(options));
      }
  
      return tree;
    }
  }
  
  function isPackageInstalled(packageName: string, tree: Tree, _context: SchematicContext): boolean {
  
    const packageJsonPath = '/package.json';
    const packageNameToCheck = packageName;
    const packageJson = getAsSourceFile(tree, packageJsonPath);
    let packageInstalled = false;
  
    packageJson.forEachChild((node: ts.Node) => {
      if (node.kind === ts.SyntaxKind.ExpressionStatement) {
        node.forEachChild(objectLiteral => {
          objectLiteral.forEachChild(property => {
            if (property.getFullText().includes('dependencies')) {
              property.forEachChild(dependency => {
                if (dependency.getFullText().includes(packageNameToCheck)) {
                  _context.logger.info('The package' + packageNameToCheck + 'has already been installed.');
                  packageInstalled = true;
                }
              });
            }
          });
        });
      }
    });
  
    return packageInstalled;
  }
  